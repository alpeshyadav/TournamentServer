const { TournamentModel } = require('../models/tournament');

const getAllRooms = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const rooms = await TournamentModel.find(
                {},
                { _id: 0, id: 1, room: 1 }
            );
            res.status(200).json({
                status: 'ok',
                data: rooms,
                error: '',
            });
        } else {
            return res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invalid Http verb!',
            });
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { getAllRooms };
