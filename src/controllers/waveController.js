const Player = require('../models/Player');
const Match = require('../models/Match');
const ResponseHelper = require('../utils/responseHelper');
const withTransaction = require('../utils/transactionWrapper');
const GAME_CONFIG = require('../config/gameConfig');

exports.startWave = async (req, res) => {
    try {
        // const result = await withTransaction(async (session) => {
        const { matchId, waveNumber, walletAddress } = req.body;
        // const { walletAddress } = req;

        // const match = await Match.findOne({
        //     _id: matchId,
        //     playerAddress: walletAddress,
        //     status: 'active'
        // }).session(session);

        const match = await Match.findOne({
            _id: matchId,
            playerAddress: walletAddress,
            status: 'active'
        });

        if (!match) {
            return ResponseHelper.error(res, new Error('Active match not found'), 404);
        }

        // Calculate wave configuration
        const waveConfig = calculateWaveConfig(waveNumber);

        match.currentWave = {
            number: waveNumber,
            config: waveConfig,
            startTime: Date.now(),
            status: 'active'
        };

        await match.save();
        // await match.save({ session });
        // return { waveConfig };
        // });

        return ResponseHelper.success(res, match, 'Wave started successfully');
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

exports.completeWave = async (req, res) => {
    try {
        // const result = await withTransaction(async (session) => {
        const { matchId, waveNumber, enemiesDefeated, accuracy, walletAddress } = req.body;
        // const { walletAddress } = req;

        // const match = await Match.findOne({
        //     _id: matchId,
        //     playerAddress: walletAddress,
        //     'currentWave.number': waveNumber,
        //     status: 'active'
        // }).session(session);

        const match = await Match.findOne({
            _id: matchId,
            playerAddress: walletAddress,
            'currentWave.number': waveNumber,
            status: 'active'
        });

        if (!match) {
            return ResponseHelper.error(res, new Error('Active wave not found'), 404);
        }

        // Calculate and apply rewards
        const baseRewards = match.currentWave.config.rewards;
        const performanceMultiplier = calculatePerformanceMultiplier(enemiesDefeated, accuracy);
        const finalRewards = calculateFinalRewards(baseRewards, performanceMultiplier);

        // Update player
        // const player = await Player.findOne({ walletAddress }).session(session);
        const player = await Player.findOne({ walletAddress });
        // updatePlayerResources(player, finalRewards);
        updatePlayerWaveStats(player, waveNumber, enemiesDefeated, accuracy);

        // Update match
        match.currentWave.status = 'completed';
        match.currentWave.performance = {
            enemiesDefeated,
            accuracy,
            rewards: finalRewards
        };

        // await Promise.all([
        //     player.save({ session }),
        //     match.save({ session })
        // ]);

        await Promise.all([
            player.save(),
            match.save()
        ]);

        // return {
        //     rewards: finalRewards,
        //     nextWave: calculateNextWavePreview(waveNumber + 1)
        // };
        // });

        return ResponseHelper.success(res, {"player":player, "march":match}, 'Wave completed successfully');
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

// Helper functions
function calculateWaveConfig(waveNumber) {
    const { BASE_ENEMIES, ENEMY_SCALING, HEALTH_SCALING, BASE_REWARDS } = GAME_CONFIG.WAVES;

    return {
        enemies: Math.floor(BASE_ENEMIES * Math.pow(ENEMY_SCALING, waveNumber - 1)),
        enemyHealth: Math.floor(100 * Math.pow(HEALTH_SCALING, waveNumber - 1)),
        rewards: {
            wood: BASE_REWARDS.wood * waveNumber,
            iron: BASE_REWARDS.iron * waveNumber,
            gold: Math.floor(BASE_REWARDS.gold * waveNumber / 2)
        },
        specialEnemies: calculateSpecialEnemies(waveNumber)
    };
}

function calculatePerformanceMultiplier(enemiesDefeated, accuracy) {
    const baseMultiplier = (enemiesDefeated * 0.1 + accuracy * 0.5) / 100;
    return Math.max(0.1, Math.min(2, baseMultiplier)); // Cap between 0.1 and 2
}

function calculateFinalRewards(baseRewards, multiplier) {
    return Object.entries(baseRewards).reduce((acc, [resource, amount]) => {
        acc[resource] = Math.floor(amount * multiplier);
        return acc;
    }, {});
}

function calculateSpecialEnemies(waveNumber) {
    return {
        bombers: Math.floor(waveNumber / 3),
        shielded: Math.floor(waveNumber / 4),
        giants: Math.floor(waveNumber / 5)
    };
}

function updatePlayerWaveStats(player, waveNumber, enemiesDefeated, accuracy) {
    player.stats.highestWave = Math.max(player.stats.highestWave || 0, waveNumber);
    player.stats.totalEnemiesDefeated += enemiesDefeated;
    player.stats.averageAccuracy = calculateNewAverage(
        player.stats.averageAccuracy || 0,
        accuracy,
        player.stats.gamesPlayed
    );
}

function calculateNewAverage(oldAverage, newValue, count) {
    return ((oldAverage * count) + newValue) / (count + 1);
}