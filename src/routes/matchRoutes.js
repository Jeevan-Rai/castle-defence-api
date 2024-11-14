const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.post('/start', matchController.startMatch);
router.post('/end', matchController.endMatch);

module.exports = router;