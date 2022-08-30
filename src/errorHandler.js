const errorHandler = (err, req, res, next) => {
    res.status(500).json({
        status: 'error',
        data: '',
        error: err,
    });
};

module.exports = { errorHandler };
