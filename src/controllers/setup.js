const bcrypt = require('bcryptjs');
const { TournamentModel } = require('../models/tournament');
const puppeteer = require('puppeteer');
const { PlayersModel } = require('../models/players');

const setup = async (n) => {
    try {
        if (!(await PlayersModel.findOne({ username: process.env.ADMIN }))) {
            const encryptedPasskey = await bcrypt.hash(
                process.env.ADMIN,
                parseInt(process.env.PASS_SALT)
            );
            const player = await PlayersModel.create({
                username: process.env.ADMIN,
                passkey: encryptedPasskey,
                played: true,
            });
            await player.save();
        }
        const tournamentRoom = await TournamentModel.find({});
        const totalRooms = tournamentRoom.length;
        if (!n && totalRooms > 0) return;
        else {
            let url = '';
            const browser = await puppeteer.launch({
                userDataDir: './data',
                args: ['--no-sandbox'],
            });
            for (
                let roomId = 0, counter = n ? totalRooms + 1 : 1;
                roomId < (n || 1);
                roomId++, counter++
            ) {
                const page = await browser.newPage();
                await page.goto(process.env.BASE_URL, {
                    waitUntil: 'domcontentloaded',
                    timeout: 0,
                });

                await Promise.resolve(page.waitForNavigation());

                url = await page.url();
                const tournamentRoom = new TournamentModel({
                    id: url,
                    room: `room${counter}`,
                });
                await tournamentRoom.save();
            }
            browser.close();
            return url;
        }
    } catch (error) {
        throw error;
    }
};

module.exports = setup;
