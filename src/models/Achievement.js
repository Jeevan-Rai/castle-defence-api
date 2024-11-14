const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['enemiesDefeated', 'wavesCompleted', 'resourcesGathered', 'level'],
        required: true
    },
    requirement: {
        count: Number,
        level: Number
    },
    rewards: {
        resources: {
            wood: Number,
            iron: Number,
            gold: Number
        },
        experience: Number,
        title: String
    },
    icon: String,
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    }
});

module.exports = mongoose.model('Achievement', achievementSchema);