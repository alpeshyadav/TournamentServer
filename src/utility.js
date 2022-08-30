const generateKey = (size) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

    const random_data = [];
    while (size--) {
        random_data.push(chars[(Math.random() * chars.length) | 0]);
    }
    return random_data.join('');
};

const calculateWinner = (gridValues) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (
            gridValues[a] !== '#' &&
            gridValues[a] === gridValues[b] &&
            gridValues[a] === gridValues[c]
        ) {
            return true;
        }
    }
    return false;
};

const shufflePlayersId = (playersId) => {
    for (let i = playersId.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playersId[i], playersId[j]] = [playersId[j], playersId[i]];
    }
    return playersId;
};

const shuffle = async (players, rooms) => {
    try {
        players = shufflePlayersId(players);
        for (
            let roomIndex = 0, playerIndex = 1;
            roomIndex < rooms.length;
            roomIndex++, playerIndex += 2
        ) {
            const [player1, player2] = [
                players[playerIndex - 1],
                players[playerIndex],
            ];

            player1.room.push(rooms[roomIndex]);
            player2.room.push(rooms[roomIndex]);
            rooms[roomIndex].players = [player1, player2];
            rooms[roomIndex].firstMove = player1.username;
            await player1.save();
            await player2.save();
            await rooms[roomIndex].save();
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    generateKey,
    shuffle,
    calculateWinner,
};
