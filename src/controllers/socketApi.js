const jwt = require('jsonwebtoken');
const { getRoomId } = require('./getRoomId');
const { usersMove } = require('./usersMove');

let users = new Set();

const socketApi = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (token) {
            if (token === process.env.VIEWER) {
                next();
            } else {
                try {
                    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
                    socket.user = decoded;

                    next();
                } catch {
                    next(
                        new Error(
                            JSON.stringify({
                                status: 'error',
                                data: '',
                                error: 'Authentication Error!',
                            })
                        )
                    );
                }
            }
        } else {
            next(
                new Error(
                    JSON.stringify({
                        status: 'error',
                        data: '',
                        error: 'Authentication Error!',
                    })
                )
            );
        }
    }).on('connection', async (socket) => {
        if (socket.user && !users.has(socket.user.username)) {
            users.add(socket.user.username);
        }
        socket.on('usermove', (msg) => {
            socket.body = msg;
            usersMove(socket);
        });
        socket.on('getRoomId', () => {
            getRoomId(socket);
        });

        socket.on('online', () => {
            io.emit('active', {
                status: 'ok',
                data: {
                    users: Array.from(users),
                },
                error: '',
            });
        });

        socket.on('audience', (data) => {
            socket.join(data.roomId);
        });

        socket.on('disconnecting', async () => {
            if (socket.user) {
                users.delete(socket.user.username);
                io.emit('active', {
                    status: 'ok',
                    data: {
                        users: Array.from(users),
                    },
                    error: '',
                });
            }
        });
    });
};

module.exports = { socketApi };
