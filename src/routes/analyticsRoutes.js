const express = require('express');
const router = express.Router();
const { getAnalyticsData } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getAnalyticsData);

module.exports = router;
