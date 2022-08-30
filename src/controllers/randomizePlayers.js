const { PlayersModel } = require('../models/players');
const { TournamentModel } = require('../models/tournament');
const { shuffle } = require('../utility');

const randomizePlayers = async (req, res, next) => {
    try {
        if (req.method === 'GET') {
            const players = await PlayersModel.find({
                $and: [{ played: false }, { username: { $ne: 'admin' } }],
            });
            let rooms = await TournamentModel.find({ resultForWinner: null });

            if (players.length === 0) {
                res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'No one registered yet!',
                });
            } else if (players.length & 1) {
                res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'Waiting for players!',
                });
            } else {
                await shuffle(players, rooms);

                res.status(200).json({
                    status: 'ok',
                    data: 'players are ready to go!',
                    error: '',
                });
            }
        } else {
            res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invlaid http verb',
            });
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    randomizePlayers,
};
