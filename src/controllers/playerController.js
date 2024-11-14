const Player = require('../models/Player');
const Achievement = require('../models/Achievement');
const ResponseHelper = require('../utils/responseHelper');
const GAME_CONFIG = require('../config/gameConfig');

exports.updateStats = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { score, wavesCompleted } = req.body;
        
        const player = await Player.findOne({ walletAddress });
        if (!player) {
            return ResponseHelper.error(res, new Error('Player not found'), 404);
        }

        player.stats.gamesPlayed += 1;
        player.stats.highScore = Math.max(player.stats.highScore, score);
        player.stats.wavesCompleted += wavesCompleted;

        await player.save();
        return ResponseHelper.success(res, player.stats);
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.registerPlayer = async (req, res) => {
    try {
        const { walletAddress, username } = req.body;
        const player = new Player({ walletAddress, username });
        await player.save();
        return ResponseHelper.success(res, player);
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.getPlayerStats = async (req, res) => {
    try {
        const player = await Player.findOne({ walletAddress: req.params.address });
        if (!player) return ResponseHelper.error(res, new Error('Player not found'), 404);
        return ResponseHelper.success(res, player);
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.updateInventory = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { arrowType, quantity } = req.body;
        const player = await Player.findOne({ walletAddress });
        if (!player) return ResponseHelper.error(res, new Error('Player not found'), 404);

        player.inventory[arrowType] += quantity;
        await player.save();
        return ResponseHelper.success(res, player.inventory);
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.craftArrows = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { arrowType, quantity } = req.body;
        const player = await Player.findOne({ walletAddress });
        if (!player) return ResponseHelper.error(res, new Error('Player not found'), 404);

        // Add crafting logic
        return ResponseHelper.success(res, player);
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { action, value } = req.body;

        const player = await Player.findOne({ walletAddress });

        // Update progress and check achievements
        const progressUpdate = await updatePlayerProgress(player, action, value);
        const newAchievements = await checkAchievements(player);

        // Apply rewards from achievements
        if (newAchievements.length > 0) {
            await applyAchievementRewards(player, newAchievements);
        }

        await player.save();

        return ResponseHelper.success(res, {
            progress: progressUpdate,
            newAchievements,
            playerStats: player.stats
        });
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.getAchievements = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const player = await Player.findOne({ walletAddress });

        const achievements = await Achievement.find({
            _id: { $in: player.achievements }
        });

        return ResponseHelper.success(res, {
            achievements,
            progress: player.achievementProgress
        });
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

// Helper functions
async function updatePlayerProgress(player, action, value) {
    const progressUpdates = {
        enemyKill: () => {
            player.stats.enemiesDefeated += value;
            player.experience += 10 * value;
            checkLevelUp(player);
        },
        waveComplete: () => {
            player.stats.wavesCompleted += 1;
            player.experience += 100;
            checkLevelUp(player);
        },
        resourceGather: () => {
            player.stats.resourcesGathered += value;
            player.experience += value;
            checkLevelUp(player);
        }
    };

    if (progressUpdates[action]) {
        progressUpdates[action]();
    }

    return player.stats;
}

function checkLevelUp(player) {
    const experienceRequired = calculateRequiredExperience(player.level);

    while (player.experience >= experienceRequired) {
        player.level += 1;
        player.experience -= experienceRequired;
        applyLevelUpRewards(player);
    }
}

function applyLevelUpRewards(player) {
    const rewards = {
        resources: {
            wood: 100 * player.level,
            iron: 50 * player.level,
            gold: 10 * player.level
        },
        stats: {
            maxHealth: 10,
            damage: 5
        }
    };

    // Apply rewards
    Object.entries(rewards.resources).forEach(([resource, amount]) => {
        player.resources[resource] += amount;
    });

    Object.entries(rewards.stats).forEach(([stat, amount]) => {
        player.stats[stat] += amount;
    });
}

async function checkAchievements(player) {
    const achievements = await Achievement.find({});
    const newAchievements = [];

    for (const achievement of achievements) {
        if (!player.achievements.includes(achievement._id) &&
            meetsAchievementRequirements(player, achievement)) {
            player.achievements.push(achievement._id);
            newAchievements.push(achievement);
        }
    }

    return newAchievements;
}

function meetsAchievementRequirements(player, achievement) {
    const requirements = {
        enemiesDefeated: () => player.stats.enemiesDefeated >= achievement.requirement.count,
        wavesCompleted: () => player.stats.wavesCompleted >= achievement.requirement.count,
        resourcesGathered: () => player.stats.resourcesGathered >= achievement.requirement.count,
        level: () => player.level >= achievement.requirement.level
    };

    return requirements[achievement.type]?.() || false;
}