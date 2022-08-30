const { Queue, QueueScheduler, Worker } = require('bullmq');
const setup = require('./controllers/setup');
const { PlayersModel } = require('./models/players');
const { TournamentModel } = require('./models/tournament');
const { shuffle } = require('./utility');

const connection = {
    host: 'localhost',
    port: 6380,
};

// Create a new connection in every instance
const mainJobQueueScheduler = new QueueScheduler('main', {
    connection: connection,
});
const mainJobQueue = new Queue('main', {
    connection: connection,
});

const mainWorker = new Worker(
    'main',
    async (job) => {
        if (job.name === 'createRoom') {
            let url = '';
            const rooms = await TournamentModel.find({});
            if (rooms.some((room) => room.resultForWinner === null)) {
                const players = await PlayersModel.find({
                    $and: [{ played: false }, { username: { $ne: 'admin' } }],
                });
                if (Math.floor(players.length / 2) > rooms.length) {
                    const roomsToCreate =
                        Math.floor(players.length / 2) - rooms.length;
                    url = await setup(roomsToCreate);
                }
            }
            await job.updateProgress(100);
            return url;
        } else {
            let resp = '';
            const players = await PlayersModel.find({
                played: false,
            });
            const rooms = await TournamentModel.find({
                resultForWinner: null,
            });
            if (rooms.length === 0 && players.length > 1) {
                await setup(players.length / 2);
                const rooms = await TournamentModel.find({
                    resultForWinner: null,
                });
                await shuffle(players, rooms);
                resp = 'ok';
            }
            await job.updateProgress(100);
            return resp;
        }
    },
    {
        connection: connection,
    }
);
mainWorker.on('completed', (job, data) => {
    if (job.name === 'createRoom') {
        data &&
            console.log(
                `Job '${job.name}' completed successfully. ${data} is created`
            );
    } else {
        data &&
            console.log(
                `Job '${job.name}' completed successfully. Created new rooms and shuffled players`
            );
    }
});
mainWorker.on('failed', (job, err) => {
    console.log(`Job '${job.name}' failed`, err);
});

const run = async (req, res, next) => {
    await mainJobQueue.add(
        'createRoom',
        {},
        {
            repeat: {
                every: 3000,
            },
            jobId: '#room',
        }
    );

    await mainJobQueue.add(
        'newGame',
        {},
        {
            repeat: {
                every: 3000,
            },
            jobId: '#newGame',
        }
    );
    next();
};

module.exports = { run };
