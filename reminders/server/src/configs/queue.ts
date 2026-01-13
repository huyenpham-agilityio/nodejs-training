import { Queue, QueueOptions } from 'bullmq';
import { redisConfig } from './redis';

const queuePrefix = process.env.BULLMQ_PREFIX || 'reminders';

// BullMQ connection configuration
export const queueConnection = {
  ...redisConfig,
  maxRetriesPerRequest: null,
};

// Default queue options
export const defaultQueueOptions: QueueOptions = {
  connection: queueConnection,
  prefix: queuePrefix,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // keep completed jobs for 24 hours
    },
    removeOnFail: {
      count: 1000,
      age: 7 * 24 * 3600, // keep failed jobs for 7 days
    },
  },
};

// Example queue - you can create more queues as needed
export const emailQueue = new Queue('email', defaultQueueOptions);
export const reminderQueue = new Queue('reminder', defaultQueueOptions);

console.log('✓ BullMQ queues initialized');

export { Queue, QueueOptions };
