const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimit');

// Public routes
router.post('/register', rateLimiter, playerController.registerPlayer);
router.get('/:address', playerController.getPlayerStats);

// Protected routes
router.use(authMiddleware);
router.put('/:walletAddress/inventory', playerController.updateInventory);
router.post('/:walletAddress/craft', playerController.craftArrows);
router.put('/:walletAddress/stats', playerController.updateStats);

module.exports = router;