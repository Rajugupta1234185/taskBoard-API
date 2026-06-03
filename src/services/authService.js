const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const {
  setSession,
  getSession,
  deleteSession,
  incrementLoginAttempts,
  getLoginAttemptsWithTTL,
  resetLoginAttempts,
  incrementAnalytics,
} = require('./redisService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const SESSION_EXPIRY = () => parseInt(process.env.SESSION_EXPIRY) || 3600;
const MAX_ATTEMPTS = () => parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const BLOCK_DURATION = () => parseInt(process.env.LOGIN_BLOCK_DURATION) || 900;

const register = async ({ fullName, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already registered.', 409);
  }

  const user = await User.create({ fullName: fullName.trim(), email: email.toLowerCase(), password });
  return { id: user._id, fullName: user.fullName, email: user.email };
};

const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase();

  const { count, ttl } = await getLoginAttemptsWithTTL(normalizedEmail);
  if (count >= MAX_ATTEMPTS()) {
    logger.warn('Login blocked — too many attempts', { email: normalizedEmail });
    throw new AppError(
      `Account temporarily locked. Too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minute(s).`,
      423
    );
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    await incrementLoginAttempts(normalizedEmail, BLOCK_DURATION());
    logger.warn('Login failed — user not found', { email: normalizedEmail });
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const attempts = await incrementLoginAttempts(normalizedEmail, BLOCK_DURATION());
    const remaining = MAX_ATTEMPTS() - attempts;
    logger.warn('Login failed — wrong password', { email: normalizedEmail, attempts });
    throw new AppError(
      remaining > 0
        ? `Invalid email or password. ${remaining} attempt(s) remaining.`
        : `Account temporarily locked. Try again in ${Math.ceil(BLOCK_DURATION() / 60)} minute(s).`,
      401
    );
  }

  await resetLoginAttempts(normalizedEmail);

  const sessionId = uuidv4();
  const sessionData = {
    userId: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    loginTime: new Date().toISOString(),
  };

  await setSession(sessionId, sessionData, SESSION_EXPIRY());
  await incrementAnalytics('totalLogins');

  logger.info('Login success', { email: user.email, userId: user._id });
  return { sessionId, user: { id: user._id, fullName: user.fullName, email: user.email } };
};

const logout = async (sessionId) => {
  const session = await getSession(sessionId);
  if (session) {
    await deleteSession(sessionId);
    logger.info('User logged out', { userId: session.userId });
  }
};

const getSessionInfo = async (sessionId) => {
  return getSession(sessionId);
};

module.exports = { register, login, logout, getSessionInfo };
