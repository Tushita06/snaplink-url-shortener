const express = require('express');
const { getStats, getIndividualStats } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All analytics are secured to the specific authenticated account
router.use(protect);

router.get('/dashboard', getStats);
router.get('/url/:urlId', getIndividualStats);

module.exports = router;
