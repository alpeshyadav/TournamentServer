const puppeteer = require('puppeteer');
const { PlayersModel } = require('../models/players');
const { TournamentModel } = require('../models/tournament');
const { calculateWinner } = require('../utility');

const usersMove = async (socket) => {
    try {
        const roomId = socket.body.roomId;
        const value = socket.body.value;
        const username = socket.user?.username;

        const roomData = await TournamentModel.findOne({
            id: roomId,
        }).populate('players');

        if (roomData?.resultForWinner) {
            if (socket.handshake.auth.token === process.env.VIEWER) {
                return socket.emit('winner', {
                    status: 'ok',
                    data: roomData.resultForWinner,
                    error: '',
                });
            }
            socket.emit('exception', {
                status: 'error',
                data: '',
                error: 'Match over!',
            });
        } else if (roomData?.firstMove === username) {
            if (roomData.grid[parseInt(value)] === '#') {
                const browser = await puppeteer.launch({
                    userDataDir: './data',
                    args: ['--no-sandbox'],
                });
                const page = await browser.newPage();

                await page.setExtraHTTPHeaders({
                    serverpermission: 'true',
                });

                await page.goto(roomData.id);
                await page.waitForSelector('#square-0', { timeout: 0 });
                // await page.waitForTimeout(1000)
                const cell = await page.$(`#square-${value}`);

                await cell.evaluate((el) => (el.style.pointerEvents = ''));
                await cell.click();
                let cellValue = await cell.evaluate((el) => el.innerText);

                await browser.close();

                if (cellValue) {
                    const players = roomData.players
                        .map((player) => player.username)
                        .filter((player) => player !== username);
                    roomData.firstMove = players[0];

                    const grid = roomData.grid.split('');
                    grid[parseInt(value)] = roomData.defaultValue;
                    roomData.grid = grid.join('');
                    roomData.defaultValue =
                        roomData.defaultValue === 'X' ? 'O' : 'X';

                    const winner = calculateWinner(grid);

                    if (winner) {
                        roomData.resultForWinner = username;
                        roomData.resultForLoser = players[0];
                        const player = await PlayersModel.findOne({
                            username: players[0],
                        });
                        player.played = true;
                        await player.save();

                        const lastStandingPlayer = await PlayersModel.find({
                            played: false,
                        });

                        const done = lastStandingPlayer.length === 1;

                        socket.to(roomId).emit('winner', {
                            status: 'ok',
                            data: { username, done },
                            error: '',
                        });
                    }
                    await roomData.save();

                    return;
                }

                return socket.emit('exception', {
                    status: 'error',
                    data: '',
                    error: 'Something went wrong. Try again!',
                });
            } else {
                socket.emit('exception', {
                    status: 'error',
                    data: '',
                    error: 'Wrong move',
                });
            }
        } else {
            if (!username) {
                return;
            }
            return socket.emit('exception', {
                status: 'error',
                data: '',
                error: 'Wait for your turn!',
            });
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = { usersMove };
