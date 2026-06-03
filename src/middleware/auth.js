const { getSession } = require('../services/redisService');
const AppError = require('../utils/AppError');

const authenticate = async (req, res, next) => {
  try {
    const fromHeader = req.headers['authorization']?.startsWith('Bearer ')
      ? req.headers['authorization'].slice(7).trim()
      : null;
    const sessionId = fromHeader || req.cookies?.sessionId;

    if (!sessionId) {
      return next(new AppError('Authentication required. Provide a Bearer token or login cookie.', 401));
    }

    const session = await getSession(sessionId);
    if (!session) {
      return next(new AppError('Session expired or invalid. Please login again.', 401));
    }

    req.session = session;
    req.sessionId = sessionId;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
