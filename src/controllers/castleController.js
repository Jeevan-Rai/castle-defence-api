const Player = require('../models/Player');
const ResponseHelper = require('../utils/responseHelper');
const GAME_CONFIG = require('../config/gameConfig');

exports.upgradeCastle = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { upgradeType, path } = req.body;

        const player = await Player.findOne({ walletAddress });
        const currentLevel = player.castle?.[upgradeType]?.level || 0;

        // Check upgrade requirements
        const requirements = calculateUpgradeRequirements(upgradeType, currentLevel, path);

        if (!meetsRequirements(player, requirements)) {
            return ResponseHelper.error(res, new Error('Upgrade requirements not met'), 400);
        }

        // Apply upgrade
        const upgrade = applyUpgrade(player, upgradeType, path);
        await player.save();

        return ResponseHelper.success(res, {
            castle: player.castle,
            resources: player.resources,
            upgradedStats: upgrade.stats
        });
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.repairCastle = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { damageAmount } = req.body;

        const player = await Player.findOne({ walletAddress });
        const repairCost = calculateRepairCost(damageAmount, player.castle);

        if (!hasEnoughResources(player, repairCost)) {
            return ResponseHelper.error(res, new Error('Insufficient resources for repair'), 400);
        }

        // Apply repair
        deductResources(player, repairCost);
        player.castle.health = Math.min(
            player.castle.maxHealth,
            player.castle.health + damageAmount
        );

        await player.save();

        return ResponseHelper.success(res, {
            castle: {
                health: player.castle.health,
                maxHealth: player.castle.maxHealth
            },
            resources: player.resources
        });
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

// Add new endpoint for specialization
exports.specializeCastle = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { specialization } = req.body;

        const player = await Player.findOne({ walletAddress });

        if (player.castle.level < 5) {
            return ResponseHelper.error(res, new Error('Castle must be level 5 for specialization'), 400);
        }

        const specializationEffects = {
            defensive: {
                health: 1.5,
                armorBonus: 20,
                repairCostReduction: 0.2
            },
            offensive: {
                damageBonus: 30,
                attackSpeed: 1.2,
                criticalChance: 0.1
            },
            economic: {
                resourceGeneration: 1.3,
                upgradeCostReduction: 0.15,
                tradeBonus: 0.1
            }
        };

        player.castle.specialization = specialization;
        player.castle.specializationEffects = specializationEffects[specialization];

        await player.save();

        return ResponseHelper.success(res, {
            castle: player.castle
        });
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

// Helper functions
function calculateUpgradeRequirements(type, level, path) {
    const baseCost = GAME_CONFIG.CASTLE.UPGRADES[type];
    const scalingFactor = Math.pow(1.5, level);

    return {
        resources: {
            wood: Math.floor(baseCost.wood * scalingFactor),
            iron: Math.floor(baseCost.iron * scalingFactor),
            gold: Math.floor(baseCost.gold * scalingFactor)
        },
        level: level + 1
    };
}

function applyUpgrade(player, type, path) {
    // Update castle stats based on upgrade type and path
    const baseStats = GAME_CONFIG.CASTLE.UPGRADES[type].effect;
    const pathMultiplier = getPathMultiplier(path);

    return {
        stats: calculateUpgradedStats(baseStats, pathMultiplier)
    };
}