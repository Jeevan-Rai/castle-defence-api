const express = require('express');
const router = express.Router();
const abilityController = require('../controllers/abilityController');
const authMiddleware = require('../middleware/auth');

router.post('/unlock/:walletAddress', authMiddleware, abilityController.unlockAbility);
router.post('/use/:walletAddress', authMiddleware, abilityController.useAbility);

module.exports = router;