import { NotificationContext } from '@/modules/notifications/notification.types';
import logger from '@/configs/logger';

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
  log(level: 'info' | 'error' | 'success', message: string, ...args: unknown[]): void {
    const prefix = `[${this.name}]`;
    const formattedMessage = `${prefix} ${message}`;
    switch (level) {
      case 'info':
        logger.info(formattedMessage, ...args);
        break;
      case 'error':
        logger.error(formattedMessage, ...args);
        break;
      case 'success':
        logger.info(formattedMessage, ...args);
        break;
    }
  }
}
