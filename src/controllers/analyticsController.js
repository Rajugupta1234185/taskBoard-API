const { getAnalytics } = require('../services/redisService');

const getAnalyticsData = async (req, res, next) => {
  try {
    const analytics = await getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalyticsData };
