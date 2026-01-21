import { NotificationProvider } from './notification.provider';
import { NotificationContext } from '../notification.types';

export class ConsoleNotificationProvider extends NotificationProvider {
  name = 'console';

  async send(context: NotificationContext): Promise<void> {
    this.log('info', '\n ===== CONSOLE NOTIFICATION =====');

    console.log(`Reminder ID: ${context.reminder_id}`);
    console.log(`User: ${context.user_email}`);
    console.log(`Title: ${context.title}`);
    console.log(`Scheduled time: ${new Date(context.scheduled_at).toLocaleString()}`);

    if (context.description) {
      console.log(`Description: ${context.description}`);
    }

    this.log('info', '===== END OF NOTIFICATION =====\n');
  }
  isConfigured(): boolean {
    return true;
  }
}
