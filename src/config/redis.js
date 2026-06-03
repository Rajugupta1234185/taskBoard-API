const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

if (process.env.REDIS_URL) {
  // Cloud Redis (Upstash, Redis Cloud, etc.) — connection string includes auth
  redis = new Redis(process.env.REDIS_URL, {
    tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    retryStrategy(times) {
      return Math.min(times * 100, 3000);
    },
  });
} else {
  // Local Redis — individual host/port/password settings
  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy(times) {
      return Math.min(times * 100, 3000);
    },
  };
  if (process.env.REDIS_PASSWORD) {
    config.password = process.env.REDIS_PASSWORD;
  }
  redis = new Redis(config);
}

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error(`Redis error: ${err.message}`));
redis.on('reconnecting', () => logger.warn('Redis reconnecting...'));

module.exports = redis;
