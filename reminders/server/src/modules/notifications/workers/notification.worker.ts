import { Job, Worker } from 'bullmq';
import { NotificationJobData } from '@/modules/notifications/notification.types';
import { QUEUE_NAMES, queueConnection } from '@/configs/queue';
import dayjs from 'dayjs';

import { notificationService } from '../notification.services';

export const notificationWorker = new Worker<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job<NotificationJobData>) => {
    const { reminder_id, title, attempts = 1 } = job.data;
    // Process the notification job
    console.log(`Processing notification job id: ${job.id} for reminder id: ${reminder_id}`);
    console.log(`Reminder: ${title} - ${reminder_id}`);

    console.log(`Attempt number: ${attempts}/${job.opts.attempts || 3}`);

    try {
      await notificationService.processReminderNotification(reminder_id);
      console.log(`✅ Successfully processed notification for reminder id: ${reminder_id}`);

      return {
        success: true,
        reminder_id,
        processed_at: dayjs().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to process notification for reminder ${reminder_id}:`, errorMessage);

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
  console.log(`Job ${job.id} has been completed.`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with error: ${err.message}`);

  if (job && job.attemptsMade >= (job.opts.attempts! || 3)) {
    console.error(`Job ${job.id} has reached the maximum number of attempts.`);
  }
});

notificationWorker.on('error', (error) => {
  console.error('Notification Worker Error:', error);
});

notificationWorker.on('ready', () => {
  console.log('✓ Notification worker is ready and listening for jobs...');
});

notificationWorker.on('active', (job) => {
  console.log(`Worker is now processing job ${job.id}`);
});

console.log('Notification worker initialized...');

export default notificationWorker;
