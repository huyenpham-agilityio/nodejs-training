import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create Redis client for general use
export const redisClient = new Redis(redisConfig);

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('✓ Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('✗ Redis client error:', err);
});

redisClient.on('ready', () => {
  console.log('✓ Redis client ready');
});

export default redisClient;
