import { Job, Worker } from 'bullmq';
import { NotificationJobData } from '@/modules/notifications/notification.types';
import { QUEUE_NAMES, queueConnection } from '@/configs/queue';
import dayjs from 'dayjs';
import logger from '@/configs/logger';

import { notificationService } from '../notification.services';
import {
  MAX_JOB_ATTEMPTS,
  WORKER_CONCURRENCY,
  RATE_LIMITER_MAX_JOBS,
  RATE_LIMITER_DURATION,
} from '@/constants/time';
import reminderRepository from '@/modules/reminders/reminder.repository';

export const notificationWorker = new Worker<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job<NotificationJobData>) => {
    const { reminder_id, title, attempts = 1 } = job.data;
    // Process the notification job
    logger.info(`Processing notification job id: ${job.id} for reminder id: ${reminder_id}`);
    logger.debug(`Reminder: ${title} - ${reminder_id}`);
    logger.debug(`Attempt number: ${attempts}/${job.opts.attempts || MAX_JOB_ATTEMPTS}`);

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
    concurrency: WORKER_CONCURRENCY,
    connection: queueConnection,
    prefix: 'reminders',
    limiter: {
      max: RATE_LIMITER_MAX_JOBS,
      duration: RATE_LIMITER_DURATION,
    },
  }
);

// Worker Event Listeners
notificationWorker.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completed successfully for reminder ${job.data.reminder_id}`);
});

notificationWorker.on('failed', async (job, err) => {
  if (job) {
    const maxAttempts = job.opts.attempts || MAX_JOB_ATTEMPTS;
    const isLastAttempt = job.attemptsMade >= maxAttempts;

    logger.error(`❌ Job ${job.id} failed (Attempt ${job.attemptsMade}/${maxAttempts}):`, {
      jobId: job.id,
      reminderId: job.data?.reminder_id,
      title: job.data?.title,
      error: err.message,
      stack: err.stack,
      attemptsMade: job.attemptsMade,
      maxAttempts: maxAttempts,
    });

    if (isLastAttempt) {
      logger.error(
        `PERMANENT FAILURE: Job ${job.id} exhausted all ${maxAttempts} attempts. Notification for reminder ${job.data?.reminder_id} will NOT be sent!`
      );

      // Update reminder status to 'cancelled' in database
      try {
        await reminderRepository.markAsCancelled(job.data.reminder_id);
        logger.info(
          `✓ Marked reminder ${job.data.reminder_id} as CANCELLED due to permanent notification failure`
        );
      } catch (dbError) {
        logger.error(
          `Failed to update reminder ${job.data.reminder_id} status to CANCELLED:`,
          dbError
        );
      }
    } else {
      logger.warn(
        `⚠️  Job ${job.id} will be retried (${maxAttempts - job.attemptsMade} attempts remaining)`
      );
    }
  }
});

notificationWorker.on('error', (error) => {
  logger.error('🚨 Notification Worker Error:', error);
});

notificationWorker.on('ready', () => {
  logger.info('✓ Notification worker is ready and listening for jobs...');
});

notificationWorker.on('active', (job) => {
  logger.debug(`⚙️  Worker is now processing job ${job.id} for reminder ${job.data.reminder_id}`);
});

notificationWorker.on('stalled', (jobId) => {
  logger.warn(
    `⚠️  Job ${jobId} has stalled (worker may have crashed, timed out, or lost connection to Redis)`
  );
  // TODO: Consider implementing:
  // - Automatic job recovery
  // - Alert on-call engineer
  // - Restart worker if pattern detected
});

notificationWorker.on('progress', (job, progress) => {
  logger.debug(`Job ${job.id} progress: ${JSON.stringify(progress)}`);
});

logger.info('Notification worker initialized...');

export default notificationWorker;
