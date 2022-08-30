const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1:27018/tictac';
const options = {
    maxPoolSize: 2, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
mongoose
    .connect(mongoDB, options)
    .then(() => {
        console.log('Successfully connected to database');
    })
    .catch((error) => {
        console.log('database connection failed. exiting now...');
        console.error(error);
        process.exit(1);
    });
