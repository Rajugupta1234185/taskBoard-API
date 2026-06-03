const { getSession } = require('../services/redisService');
const AppError = require('../utils/AppError');

const authenticate = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return next(new AppError('Authentication required. Please login.', 401));
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
