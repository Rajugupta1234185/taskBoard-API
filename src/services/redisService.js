const redis = require('../config/redis');

const KEYS = {
  session: (id) => `session:${id}`,
  rateLimit: (ip) => `ratelimit:${ip}`,
  taskCache: (userId) => `cache:tasks:${userId}`,
  loginAttempts: (email) => `loginattempts:${email.toLowerCase()}`,
  analytics: {
    totalLogins: 'analytics:totalLogins',
    tasksCreated: 'analytics:tasksCreated',
    tasksUpdated: 'analytics:tasksUpdated',
    tasksDeleted: 'analytics:tasksDeleted',
  },
};

// ── Session ──────────────────────────────────────────────────────────────────

const setSession = async (sessionId, data, ttlSeconds) => {
  await redis.set(KEYS.session(sessionId), JSON.stringify(data), 'EX', ttlSeconds);
};

const getSession = async (sessionId) => {
  const data = await redis.get(KEYS.session(sessionId));
  return data ? JSON.parse(data) : null;
};

const deleteSession = async (sessionId) => {
  await redis.del(KEYS.session(sessionId));
};

// ── Rate Limiting ─────────────────────────────────────────────────────────────

const checkRateLimit = async (ip, maxRequests, windowSeconds) => {
  const key = KEYS.rateLimit(ip);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  const ttl = await redis.ttl(key);
  return { count, ttl, exceeded: count > maxRequests };
};

// ── Task Cache ────────────────────────────────────────────────────────────────

const getTaskCache = async (userId) => {
  const data = await redis.get(KEYS.taskCache(userId));
  return data ? JSON.parse(data) : null;
};

const setTaskCache = async (userId, tasks, ttlSeconds) => {
  await redis.set(KEYS.taskCache(userId), JSON.stringify(tasks), 'EX', ttlSeconds);
};

const invalidateTaskCache = async (userId) => {
  await redis.del(KEYS.taskCache(userId));
};

// ── Login Attempt Tracking ────────────────────────────────────────────────────

const incrementLoginAttempts = async (email, blockDurationSeconds) => {
  const key = KEYS.loginAttempts(email);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, blockDurationSeconds);
  }
  return count;
};

const getLoginAttempts = async (email) => {
  const count = await redis.get(KEYS.loginAttempts(email));
  return count ? parseInt(count) : 0;
};

const resetLoginAttempts = async (email) => {
  await redis.del(KEYS.loginAttempts(email));
};

const getLoginAttemptsWithTTL = async (email) => {
  const key = KEYS.loginAttempts(email);
  const [count, ttl] = await Promise.all([redis.get(key), redis.ttl(key)]);
  return { count: count ? parseInt(count) : 0, ttl };
};

// ── Analytics ─────────────────────────────────────────────────────────────────

const incrementAnalytics = async (field) => {
  await redis.incr(KEYS.analytics[field]);
};

const getAnalytics = async () => {
  const [totalLogins, tasksCreated, tasksUpdated, tasksDeleted] = await Promise.all([
    redis.get(KEYS.analytics.totalLogins),
    redis.get(KEYS.analytics.tasksCreated),
    redis.get(KEYS.analytics.tasksUpdated),
    redis.get(KEYS.analytics.tasksDeleted),
  ]);

  return {
    totalLogins: parseInt(totalLogins) || 0,
    tasksCreated: parseInt(tasksCreated) || 0,
    tasksUpdated: parseInt(tasksUpdated) || 0,
    tasksDeleted: parseInt(tasksDeleted) || 0,
  };
};

module.exports = {
  setSession,
  getSession,
  deleteSession,
  checkRateLimit,
  getTaskCache,
  setTaskCache,
  invalidateTaskCache,
  incrementLoginAttempts,
  getLoginAttempts,
  resetLoginAttempts,
  getLoginAttemptsWithTTL,
  incrementAnalytics,
  getAnalytics,
};
