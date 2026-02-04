import { NotificationContext } from '@/modules/notifications/notification.types';

export abstract class NotificationProvider {
  // Name of the notification provider
  abstract readonly name: string;

  /**
   * Send notification using the specific provider
   * @param context - Notification context containing all necessary data
   * @throws Error if sending fails
   */
  abstract send(context: NotificationContext): Promise<void>;

  /**
   * Validate if the provider is properly configured
   */
  abstract isConfigured(): boolean;

  /**
   * Log provider activity
   */
  log(level: 'info' | 'error' | 'success', message: string, ...args: any[]): void {
    const prefix = `[${this.name}]`;
    switch (level) {
      case 'info':
        console.log(`ℹ️  ${prefix}`, message, ...args);
        break;
      case 'error':
        console.error(`❌ ${prefix}`, message, ...args);
        break;
      case 'success':
        console.log(`✅ ${prefix}`, message, ...args);
        break;
    }
  }
}
