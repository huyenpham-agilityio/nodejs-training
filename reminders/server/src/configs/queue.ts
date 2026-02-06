import { Queue, QueueOptions } from 'bullmq';
import { redisConfig } from './redis';
import { NotificationJobData } from '@/modules/notifications/notification.types';
import dayjs from 'dayjs';
import logger from './logger';
import {
  MAX_JOB_ATTEMPTS,
  JOB_BACKOFF_DELAY,
  COMPLETED_JOBS_RETENTION_COUNT,
  COMPLETED_JOBS_RETENTION_AGE,
  FAILED_JOBS_RETENTION_COUNT,
  FAILED_JOBS_RETENTION_AGE,
} from '@/constants/time';

const queuePrefix = process.env.BULLMQ_PREFIX || 'reminders';

// BullMQ connection configuration
export const queueConnection = {
  ...redisConfig,
  maxRetriesPerRequest: null,
};

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
};

// Default queue options
export const defaultQueueOptions: QueueOptions = {
  connection: queueConnection,
  prefix: queuePrefix,
  defaultJobOptions: {
    attempts: MAX_JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: JOB_BACKOFF_DELAY,
    },
    removeOnComplete: {
      count: COMPLETED_JOBS_RETENTION_COUNT,
      age: COMPLETED_JOBS_RETENTION_AGE,
    },
    removeOnFail: {
      count: FAILED_JOBS_RETENTION_COUNT,
      age: FAILED_JOBS_RETENTION_AGE,
    },
  },
};

// Queues
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, defaultQueueOptions);

export const scheduleNotificationJob = async (
  data: NotificationJobData,
  scheduledTime: Date
): Promise<void> => {
  const delay = dayjs(scheduledTime).diff(dayjs(), 'millisecond');
  const actualDelay = delay > 0 ? delay : 0;

  await notificationQueue.add('send_notification', data, {
    jobId: `reminder-${data.reminder_id}`,
    delay: actualDelay,
    priority: 1,
  });

  logger.info(`Added notification job for reminder ID ${data.reminder_id} to the queue`);
  logger.debug(`Scheduled to run in ${actualDelay}ms (${dayjs(scheduledTime).toISOString()})`);
};

export const cancelNotificationJob = async (reminderId: number): Promise<void> => {
  const jobId = `reminder-${reminderId}`;
  const job = await notificationQueue.getJob(jobId);

  if (job) {
    await job.remove();
    logger.info(`Cancelled notification job for reminder ID ${reminderId}`);
  } else {
    logger.debug(`No notification job found for reminder ID ${reminderId} to cancel`);
  }
};

export const rescheduleNotificationJob = async (
  data: NotificationJobData,
  newScheduledTime: Date
): Promise<void> => {
  await cancelNotificationJob(data.reminder_id);
  await scheduleNotificationJob(data, newScheduledTime);
  logger.info(`Rescheduled notification job for reminder ID ${data.reminder_id}`);
};

// Queue Event Listeners
notificationQueue.on('error', (error) => {
  logger.error('Notification Queue Error:', error);
});

notificationQueue.on('waiting', (job) => {
  console.log('Waiting job:', job.id);

  logger.debug(`Job ${job.id} is waiting to be processed`);
});

// Log when queue is ready
logger.info('✓ Notification queue initialized');

export default notificationQueue;
