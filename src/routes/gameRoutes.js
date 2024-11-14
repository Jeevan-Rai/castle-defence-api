// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const waveController = require('../controllers/waveController');
const castleController = require('../controllers/castleController');
const abilityController = require('../controllers/abilityController');
const authMiddleware = require('../middleware/auth');

// Wave routes
router.post('/wave/start', authMiddleware, waveController.startWave);
router.post('/wave/complete', authMiddleware, waveController.completeWave);

// Castle routes
router.post('/castle/upgrade/:walletAddress', authMiddleware, castleController.upgradeCastle);
router.post('/castle/repair/:walletAddress', authMiddleware, castleController.repairCastle);

// Ability routes
router.post('/ability/unlock/:walletAddress', authMiddleware, abilityController.unlockAbility);
router.post('/ability/use/:walletAddress', authMiddleware, abilityController.useAbility);

module.exports = router;