const mongoose = require('mongoose');

const castleUpgradeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['walls', 'tower', 'arsenal'],
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    requirements: {
        resources: {
            wood: Number,
            iron: Number,
            gold: Number
        },
        castleLevel: Number
    },
    effects: {
        health: Number,
        damage: Number,
        defense: Number,
        storage: Number,
        specialAbility: {
            type: String,
            description: String,
            unlocked: Boolean
        }
    }
});

module.exports = mongoose.model('CastleUpgrade', castleUpgradeSchema);