const GAME_CONFIG = {
    ABILITIES: {
        multiShot: {
            cost: { gold: 50 },
            cooldown: 30,
            effect: { damage: 2, duration: 10 }
        },
        freezeTime: {
            cost: { gold: 75 },
            cooldown: 60,
            effect: { duration: 5 }
        },
        rainOfArrows: {
            cost: { gold: 100 },
            cooldown: 90,
            effect: { damage: 5, duration: 8 }
        }
    },
    CASTLE: {
        UPGRADES: {
            walls: { wood: 100, iron: 50, gold: 10, effect: { health: 50 } },
            tower: { wood: 150, iron: 75, gold: 15, effect: { damage: 25 } },
            arsenal: { wood: 200, iron: 100, gold: 20, effect: { capacity: 10 } }
        },
        REPAIR_COST_MULTIPLIER: 0.5,
        MAX_HEALTH: 100
    },
    WAVES: {
        BASE_ENEMIES: 5,
        ENEMY_SCALING: 1.2,
        HEALTH_SCALING: 1.1,
        BASE_REWARDS: {
            wood: 10,
            iron: 5,
            gold: 1
        }
    }
};

module.exports = GAME_CONFIG;