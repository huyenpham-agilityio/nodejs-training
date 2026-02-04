import { NotificationProvider } from './notification.provider';
import { NotificationContext, NotificationProviderType } from '../notification.types';
import dayjs from 'dayjs';
import logger from '@/configs/logger';

export class ConsoleNotificationProvider extends NotificationProvider {
  name = NotificationProviderType.CONSOLE;

  async send(context: NotificationContext): Promise<void> {
    this.log('info', '\n ===== CONSOLE NOTIFICATION =====');

    logger.info(`Reminder ID: ${context.reminder_id}`);
    logger.info(`User: ${context.user_email}`);
    logger.info(`Title: ${context.title}`);
    logger.info(`Scheduled time: ${dayjs(context.scheduled_at).format('YYYY-MM-DD HH:mm:ss')}`);

    if (context.description) {
      logger.info(`Description: ${context.description}`);
    }

    this.log('info', '===== END OF NOTIFICATION =====\n');
  }
  isConfigured(): boolean {
    return true;
  }
}
