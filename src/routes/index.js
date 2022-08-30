const { adminLogin } = require('../controllers/adminLogin');
const { generatePasskey } = require('../controllers/generatePasskey');
const { getAllRooms } = require('../controllers/getAllRooms');
const { getPlayers } = require('../controllers/getPlayers');
const { loginUser } = require('../controllers/loginUser');
const { randomizePlayers } = require('../controllers/randomizePlayers');
const { verifyToken } = require('../middleware/auth');

const appRoutes = (app) => {
    app.use('/adminlogin', adminLogin);
    app.use('/login', loginUser);
    app.use('/generatepasskey', verifyToken, generatePasskey);
    app.use('/randomize', verifyToken, randomizePlayers);
    app.use('/getplayers', getPlayers);
    app.use('/getallrooms', getAllRooms);
    app.use('*', (_, res) =>
        res.status(200).json({ message: 'Oops! Invalid Route' })
    );
};

module.exports = appRoutes;
