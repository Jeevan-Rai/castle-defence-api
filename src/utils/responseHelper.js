class ResponseHelper {
    static success(res, data, message = 'Success') {
        return res.json({
            success: true,
            message,
            data
        });
    }

    static error(res, error, status = 500) {
        console.error(error);
        return res.status(status).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}

module.exports = ResponseHelper;