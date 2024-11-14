const mongoose = require('mongoose');

const abilitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['multiShot', 'freezeTime', 'rainOfArrows']
    },
    level: {
        type: Number,
        default: 1
    },
    experience: {
        type: Number,
        default: 0
    },
    lastUsed: Date
});

const castleSchema = new mongoose.Schema({
    level: {
        type: Number,
        default: 1
    },
    health: {
        type: Number,
        default: 100
    },
    maxHealth: {
        type: Number,
        default: 100
    },
    upgrades: {
        walls: { type: Number, default: 0 },
        tower: { type: Number, default: 0 },
        arsenal: { type: Number, default: 0 }
    },
    specialization: {
        type: String,
        enum: ['defensive', 'offensive', 'economic', null],
        default: null
    },
    specializationEffects: {
        healthMultiplier: { type: Number, default: 1 },
        damageMultiplier: { type: Number, default: 1 },
        resourceMultiplier: { type: Number, default: 1 }
    }
});

const playerSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    username: String,
    level: {
        type: Number,
        default: 1
    },
    experience: {
        type: Number,
        default: 0
    },
    stats: {
        highScore: { type: Number, default: 0 },
        gamesPlayed: { type: Number, default: 0 },
        wavesCompleted: { type: Number, default: 0 },
        enemiesDefeated: { type: Number, default: 0 },
        resourcesGathered: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        playtime: { type: Number, default: 0 }, // in minutes
        highestWave: { type: Number, default: 0 }
    },
    resources: {
        wood: { type: Number, default: 0 },
        iron: { type: Number, default: 0 },
        gold: { type: Number, default: 0 }
    },
    inventory: {
        basicArrows: { type: Number, default: 0 },
        fireArrows: { type: Number, default: 0 },
        iceArrows: { type: Number, default: 0 }
    },
    abilities: [abilitySchema],
    castle: castleSchema,
    achievements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement'
    }],
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes
playerSchema.index({ walletAddress: 1 });
playerSchema.index({ 'stats.highScore': -1 });

module.exports = mongoose.model('Player', playerSchema);