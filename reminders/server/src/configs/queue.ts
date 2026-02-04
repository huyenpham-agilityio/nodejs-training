import { Queue, QueueOptions } from 'bullmq';
import { redisConfig } from './redis';
import { NotificationJobData } from '@/modules/notifications/notification.types';
import dayjs from 'dayjs';

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

  console.log(`Added notification job for reminder ID ${data.reminder_id} to the queue`);
  console.log(`Scheduled to run in ${actualDelay}ms (${dayjs(scheduledTime).toISOString()})`);
};

export const cancelNotificationJob = async (reminderId: number): Promise<void> => {
  const jobId = `reminder-${reminderId}`;
  const job = await notificationQueue.getJob(jobId);

  if (job) {
    await job.remove();
    console.log(`Cancelled notification job for reminder ID ${reminderId}`);
  } else {
    console.log(`No notification job found for reminder ID ${reminderId} to cancel`);
  }
};

export const rescheduleNotificationJob = async (
  data: NotificationJobData,
  newScheduledTime: Date
): Promise<void> => {
  await cancelNotificationJob(data.reminder_id);
  await scheduleNotificationJob(data, newScheduledTime);
  console.log(`Rescheduled notification job for reminder ID ${data.reminder_id}`);
};

notificationQueue.on('error', (error) => {
  console.error('Notification Queue Error:', error);
});

notificationQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting to be processed`);
});

// Log when queue is ready
console.log('✓ Notification queue initialized');

export default notificationQueue;
