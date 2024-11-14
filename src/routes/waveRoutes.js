const express = require('express');
const router = express.Router();
const waveController = require('../controllers/waveController');
const authMiddleware = require('../middleware/auth');

router.post('/start', authMiddleware, waveController.startWave);
router.post('/complete', authMiddleware, waveController.completeWave);

module.exports = router;