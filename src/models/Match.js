const mongoose = require('mongoose');

const waveSchema = new mongoose.Schema({
    number: Number,
    startTime: Date,
    endTime: Date,
    enemiesSpawned: Number,
    enemiesDefeated: Number,
    accuracy: Number,
    resources: {
        wood: Number,
        iron: Number,
        gold: Number
    },
    specialEnemies: {
        bombers: Number,
        shielded: Number,
        giants: Number
    }
});

const matchSchema = new mongoose.Schema({
    playerAddress: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    waves: [waveSchema],
    currentWave: {
        number: Number,
        config: {
            enemies: Number,
            enemyHealth: Number,
            rewards: {
                wood: Number,
                iron: Number,
                gold: Number
            }
        },
        startTime: Date,
        status: {
            type: String,
            enum: ['active', 'completed', 'failed']
        }
    },
    score: {
        type: Number,
        default: 0
    },
    stats: {
        totalEnemiesDefeated: Number,
        highestCombo: Number,
        accuracy: Number,
        abilitiesUsed: Number,
        resourcesGained: {
            wood: Number,
            iron: Number,
            gold: Number
        }
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date
}, {
    timestamps: true
});

matchSchema.index({ playerAddress: 1, status: 1 });
matchSchema.index({ 'stats.score': -1 });

module.exports = mongoose.model('Match', matchSchema);