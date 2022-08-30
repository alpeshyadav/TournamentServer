const { TournamentModel } = require('../models/tournament');

const getPlayers = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const tournamentPlayers = await TournamentModel.findOne({
                id: req.body.roomId,
            }).populate('players');
            const players = tournamentPlayers.players.map(
                (player) => player.username
            );

            res.status(200).json({
                status: 'ok',
                data: players,
                error: '',
            });
        } else {
            res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invalid http verb',
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getPlayers };
