const mongoose = require('mongoose');

const withTransaction = async (operations) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await operations(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

module.exports = withTransaction;