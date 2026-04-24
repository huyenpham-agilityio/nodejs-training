import Redis from 'ioredis';
import logger from './logger';

export const redisConfig = process.env.REDIS_URL
  ? {
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    };

// Create Redis client for general use
export const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false })
  : new Redis(redisConfig);

// Handle Redis connection events
redisClient.on('connect', () => {
  logger.info('✓ Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('✗ Redis client error:', err);
});

redisClient.on('ready', () => {
  logger.info('✓ Redis client ready');
});

export default redisClient;
