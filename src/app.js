const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const setup = require('./controllers/setup');
const appRoutes = require('./routes');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { errorHandler } = require('./errorHandler');
const { run } = require('./backgroundTasks');
const { socketApi } = require('./controllers/socketApi');
require('./models/db');
require('dotenv').config();

setup();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Access-Control-Allow-Origin'],
    },
});

app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.json());
app.use(run);

appRoutes(app);

socketApi(io);

app.use(errorHandler);

httpServer.listen(process.env.API_PORT, () =>
    console.log(`listening on ${process.env.API_PORT}`)
);
