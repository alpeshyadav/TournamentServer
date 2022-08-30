const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateKey } = require('../utility');
const { PlayersModel } = require('../models/players');

const generatePasskey = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const username = req.body.username.trim().toLowerCase();
            const size = parseInt(req.body.size);
            if (size < 3) {
                res.status(200).send({
                    status: 'error',
                    data: '',
                    error: 'key of length more than 3 is required!',
                });
            } else {
                const playerExist = await PlayersModel.findOne({
                    username,
                });
                if (playerExist) {
                    res.status(200).json({
                        status: 'error',
                        data: '',
                        error: 'username already exists',
                    });
                } else {
                    const key = generateKey(size);
                    const encryptedPasskey = await bcrypt.hash(
                        key,
                        parseInt(process.env.PASS_SALT)
                    );
                    const player = new PlayersModel({
                        username,
                        passkey: encryptedPasskey,
                    });
                    const token = jwt.sign(
                        {
                            username,
                            size,
                        },
                        process.env.TOKEN_KEY,
                        { expiresIn: '1d' }
                    );
                    player.token = token;
                    const newPlayerData = await player.save();

                    res.status(200).send({
                        status: 'ok',
                        data: {
                            username: newPlayerData.username,
                            passkey: key,
                        },
                        error: '',
                    });
                }
            }
        } else {
            res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invlaid http verb',
            });
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { generatePasskey };
