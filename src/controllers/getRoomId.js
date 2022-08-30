const { PlayersModel } = require('../models/players');
const getRoomId = async (socket) => {
    try {
        const username = socket.user.username;

        const user = await PlayersModel.findOne({ username }).populate('room');
        const roomId = user.room[user.room.length - 1].id;

        await socket.join(roomId);

        socket.emit('roomId', {
            status: 'ok',
            data: {
                url: roomId,
            },
            error: '',
        });
    } catch (error) {
        console.error(error);
    }
};

module.exports = { getRoomId };
