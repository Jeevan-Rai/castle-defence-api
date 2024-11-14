const Player = require('../models/Player');
const ResponseHelper = require('../utils/responseHelper');
const GAME_CONFIG = require('../config/gameConfig');

// Add cooldown tracking to Player model
const cooldownMap = new Map();

exports.unlockAbility = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { abilityType } = req.body;

        const player = await Player.findOne({ walletAddress });

        // Check if ability is already unlocked
        if (player.abilities?.includes(abilityType)) {
            return ResponseHelper.error(res, new Error('Ability already unlocked'), 400);
        }

        const abilityCost = GAME_CONFIG.ABILITIES[abilityType].cost;
        if (!hasEnoughResources(player, abilityCost)) {
            return ResponseHelper.error(res, new Error('Insufficient resources'), 400);
        }

        // Deduct resources and unlock ability
        deductResources(player, abilityCost);
        player.abilities = [...(player.abilities || []),
        {
            type: abilityType,
            level: 1,
            experience: 0,
            lastUsed: null
        }
        ];

        await player.save();
        return ResponseHelper.success(res, {
            abilities: player.abilities,
            resources: player.resources
        });
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.useAbility = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { abilityType, matchId, targetPosition } = req.body;

        const player = await Player.findOne({ walletAddress });
        const ability = player.abilities.find(a => a.type === abilityType);

        if (!ability) {
            return ResponseHelper.error(res, new Error('Ability not unlocked'), 400);
        }

        // Check cooldown
        const cooldownKey = `${walletAddress}-${abilityType}`;
        const lastUsed = cooldownMap.get(cooldownKey);
        const cooldownTime = GAME_CONFIG.ABILITIES[abilityType].cooldown;

        if (lastUsed && Date.now() - lastUsed < cooldownTime * 1000) {
            const remainingCooldown = Math.ceil((cooldownTime * 1000 - (Date.now() - lastUsed)) / 1000);
            return ResponseHelper.error(res, new Error(`Ability on cooldown for ${remainingCooldown} seconds`), 400);
        }

        // Calculate ability effect based on level
        const baseEffect = GAME_CONFIG.ABILITIES[abilityType].effect;
        const levelMultiplier = 1 + (ability.level - 1) * 0.1; // 10% increase per level
        const finalEffect = calculateAbilityEffect(baseEffect, levelMultiplier);

        // Add ability experience
        ability.experience += 10;
        if (ability.experience >= 100) {
            ability.level += 1;
            ability.experience = 0;
        }

        // Set cooldown
        cooldownMap.set(cooldownKey, Date.now());
        ability.lastUsed = Date.now();

        await player.save();

        return ResponseHelper.success(res, {
            effect: finalEffect,
            cooldown: cooldownTime,
            ability: {
                level: ability.level,
                experience: ability.experience
            }
        });
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

// Helper functions
function calculateAbilityEffect(baseEffect, multiplier) {
    return Object.entries(baseEffect).reduce((acc, [key, value]) => {
        acc[key] = Math.round(value * multiplier * 100) / 100;
        return acc;
    }, {});
}