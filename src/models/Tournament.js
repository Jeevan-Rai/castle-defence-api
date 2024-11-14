const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    participants: [{
        playerAddress: String,
        score: Number,
        rank: Number
    }],
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    }
});

module.exports = mongoose.model('Tournament', tournamentSchema);