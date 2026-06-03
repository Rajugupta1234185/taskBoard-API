const express = require('express');
const router = express.Router();
const { getAnalyticsData } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

/**
 * @openapi
 * /analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get activity analytics
 *     description: |
 *       Returns cumulative counters maintained in Redis using atomic INCR operations.
 *       Counters are persistent (no TTL) and increment in real time.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Analytics' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/', authenticate, getAnalyticsData);

module.exports = router;
