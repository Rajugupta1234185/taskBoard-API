const { checkRateLimit } = require('../services/redisService');
const AppError = require('../utils/AppError');

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 20;
    const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW) || 60;

    const { count, ttl, exceeded } = await checkRateLimit(ip, maxRequests, windowSeconds);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
    res.setHeader('X-RateLimit-Reset', ttl);

    if (exceeded) {
      return next(
        new AppError(`Rate limit exceeded. Max ${maxRequests} requests per minute. Retry after ${ttl}s.`, 429)
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { rateLimiter };
