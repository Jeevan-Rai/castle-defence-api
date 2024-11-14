const express = require('express');
const router = express.Router();
const castleController = require('../controllers/castleController');
const authMiddleware = require('../middleware/auth');

router.post('/upgrade/:walletAddress', authMiddleware, castleController.upgradeCastle);
router.post('/repair/:walletAddress', authMiddleware, castleController.repairCastle);

module.exports = router;