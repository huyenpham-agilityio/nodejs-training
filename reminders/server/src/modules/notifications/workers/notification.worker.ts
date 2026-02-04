import { Job, Worker } from 'bullmq';
import { NotificationJobData } from '@/modules/notifications/notification.types';
import { QUEUE_NAMES, queueConnection } from '@/configs/queue';
import dayjs from 'dayjs';
import logger from '@/configs/logger';

import { notificationService } from '../notification.services';

export const notificationWorker = new Worker<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job<NotificationJobData>) => {
    const { reminder_id, title, attempts = 1 } = job.data;
    // Process the notification job
    logger.info(`Processing notification job id: ${job.id} for reminder id: ${reminder_id}`);
    logger.debug(`Reminder: ${title} - ${reminder_id}`);
    logger.debug(`Attempt number: ${attempts}/${job.opts.attempts || 3}`);

    try {
      await notificationService.processReminderNotification(reminder_id);
      logger.info(`✅ Successfully processed notification for reminder id: ${reminder_id}`);

      return {
        success: true,
        reminder_id,
        processed_at: dayjs().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ Failed to process notification for reminder ${reminder_id}:`, errorMessage);

      job.updateData({
        ...job.data,
        attempts: attempts + 1,
      });
      throw error;
    }
  },
  {
    concurrency: 5,
    connection: queueConnection,
    prefix: process.env.BULLMQ_PREFIX || 'reminders',
    limiter: {
      max: 10, // max 10 jobs at a time
      duration: 1000, // per second
    },
  }
);

notificationWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} has been completed.`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} has failed with error: ${err.message}`);

  if (job && job.attemptsMade >= (job.opts.attempts! || 3)) {
    logger.error(`Job ${job.id} has reached the maximum number of attempts.`);
  }
});

notificationWorker.on('error', (error) => {
  logger.error('Notification Worker Error:', error);
});

notificationWorker.on('ready', () => {
  logger.info('✓ Notification worker is ready and listening for jobs...');
});

notificationWorker.on('active', (job) => {
  logger.debug(`Worker is now processing job ${job.id}`);
});

logger.info('Notification worker initialized...');

export default notificationWorker;
