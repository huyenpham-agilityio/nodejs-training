import { NotificationProvider } from './notification.provider';
import { NotificationContext, NotificationProviderType } from '../notification.types';
import dayjs from 'dayjs';

export class ConsoleNotificationProvider extends NotificationProvider {
  name = NotificationProviderType.CONSOLE;

  async send(context: NotificationContext): Promise<void> {
    this.log('info', '\n ===== CONSOLE NOTIFICATION =====');

    console.log(`Reminder ID: ${context.reminder_id}`);
    console.log(`User: ${context.user_email}`);
    console.log(`Title: ${context.title}`);
    console.log(`Scheduled time: ${dayjs(context.scheduled_at).format('YYYY-MM-DD HH:mm:ss')}`);

    if (context.description) {
      console.log(`Description: ${context.description}`);
    }

    this.log('info', '===== END OF NOTIFICATION =====\n');
  }
  isConfigured(): boolean {
    return true;
  }
}
