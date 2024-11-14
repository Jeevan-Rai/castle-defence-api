const Match = require('../models/Match');
const Player = require('../models/Player');
const catoffService = require('../services/catoffService');
const ResponseHelper = require('../utils/responseHelper');
const withTransaction = require('../utils/transactionWrapper');
const GAME_CONFIG = require('../config/gameConfig');

// exports.startMatch = async (req, res) => {
//     try {
//         console.log('Request body:', req.body);
//         const result = await withTransaction(async (session) => {
//             const { walletAddress } = req;

//             // Check if player has an active match
//             const activeMatch = await Match.findOne({
//                 playerAddress: walletAddress,
//                 status: 'active'
//             });

//             if (activeMatch) {
//                 return ResponseHelper.error(res, new Error('Player has an active match'), 400);
//             }

//             const match = new Match({
//                 playerAddress: walletAddress,
//                 startTime: Date.now(),
//                 status: 'active'
//             });

//             await match.save({ session });

//             // Register with Catoff
//             await catoffService.registerMatch({
//                 matchId: match._id,
//                 playerAddress: walletAddress
//             });

//             return match;
//         });

//         return ResponseHelper.success(res, result, 'Match started successfully');
//     } catch (error) {
//         console.error('Error details:', error);
//         return ResponseHelper.error(res, error);
//     }
// };


exports.startMatch = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { playerAddress } = req.body;

        // Check for active match
        const activeMatch = await Match.findOne({
            playerAddress,
            status: 'active'
        });

        if (activeMatch) {
            return ResponseHelper.error(res, new Error('Player has an active match'), 400);
        }

        const match = new Match({
            playerAddress,
            currentWave: {
                number: 1,
                config: {
                    enemies: 5,
                    enemyHealth: 100,
                    rewards: { wood: 10, iron: 5, gold: 1 }
                },
                status: 'active'
            },
            stats: {
                totalEnemiesDefeated: 0,
                highestCombo: 0,
                accuracy: 0,
                abilitiesUsed: 0,
                resourcesGained: { wood: 0, iron: 0, gold: 0 }
            },
            startTime: Date.now(),
            status: 'active'
        });

        await match.save();

        // Register with Catoff
        try {
            await catoffService.registerMatch({
                matchId: match._id,
                playerAddress
            });
        } catch (error) {
            console.error('Catoff registration error:', error);
        }

        return ResponseHelper.success(res, match, 'Match started successfully');
    } catch (error) {
        console.error('Error details:', error);
        return ResponseHelper.error(res, error);
    }
};

exports.endMatch = async (req, res) => {
    try {
        // const result = await withTransaction(async (session) => {
        const { matchId, score, wavesCompleted, walletAddress } = req.body;
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

        // Calculate rewards
        const rewards = calculateMatchRewards(wavesCompleted, score);

        // Update player stats and resources
        // const player = await Player.findOne({ walletAddress }).session(session);
        const player = await Player.findOne({ walletAddress });
        updatePlayerStats(player, score, wavesCompleted);
        updatePlayerResources(player, rewards);

        // Update match
        match.score = score;
        match.wavesCompleted = wavesCompleted;
        match.rewards = rewards;
        match.status = 'completed';
        match.endTime = Date.now();

        await Promise.all([
            // match.save({ session }),
            match.save(),
            // player.save({ session }),
            player.save()
        ]);

        try {
            catoffService.submitMatchResult({
                matchId: match._id,
                playerAddress: walletAddress,
                score,
                wavesCompleted,
                rewards
            })
        } catch (error) {
            console.error('Catoff registration error:', error);
        }

        // return { match, rewards };
        // });

        return ResponseHelper.success(res, {"Player":player, "match":match}, 'Match completed successfully');
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
};

// Helper functions
function calculateMatchRewards(wavesCompleted, score) {
    return {
        gold: Math.floor(wavesCompleted * GAME_CONFIG.WAVES.BASE_REWARDS.gold * (score / 1000)),
        wood: Math.floor(wavesCompleted * GAME_CONFIG.WAVES.BASE_REWARDS.wood),
        iron: Math.floor(wavesCompleted * GAME_CONFIG.WAVES.BASE_REWARDS.iron)
    };
}

function updatePlayerStats(player, score, wavesCompleted) {
    player.stats.gamesPlayed += 1;
    player.stats.totalWavesCompleted += wavesCompleted;
    player.stats.highScore = Math.max(player.stats.highScore, score);
}

function updatePlayerResources(player, rewards) {
    Object.entries(rewards).forEach(([resource, amount]) => {
        player.resources[resource] += amount;
    });
}