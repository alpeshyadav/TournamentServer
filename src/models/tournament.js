const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    firstMove: {
        type: String,
        default: null,
    },
    grid: {
        type: String,
        default: '#########',
    },
    defaultValue: {
        type: String,
        default: 'X',
    },
    players: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Player',
        default: [],
    },
    resultForWinner: {
        type: String,
        default: null,
    },
    resultForLoser: {
        type: String,
        default: null,
    },
});

const TournamentModel = mongoose.model('Tournament', TournamentSchema);

module.exports = {
    TournamentModel,
};
