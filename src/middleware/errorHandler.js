const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    if (err.code === 11000) {
        return res.status(409).json({ message: 'Duplicate resource' });
    }

    res.status(500).json({ message: 'Something went wrong!' });
};

module.exports = errorHandler;