import { NotificationProvider } from './notification.provider';
import { ConsoleNotificationProvider } from './console.provider';
import { EmailNotificationProvider } from './email.provider';
import { SlackNotificationProvider } from './slack.provider';

export class NotificationProviderFactory {
  private providers: NotificationProvider[] = [];

  /**
   * Initialize all notification providers
   * This should be called after environment variables are loaded
   */
  initialize(): void {
    // Clear existing providers to allow re-initialization if needed
    this.providers = [];

    // Initialize all available providers
    const consoleProvider = new ConsoleNotificationProvider();
    const emailProvider = new EmailNotificationProvider();
    const slackProvider = new SlackNotificationProvider();

    this.providers.push(consoleProvider);
    this.providers.push(emailProvider);
    this.providers.push(slackProvider);
  }

  register(provider: NotificationProvider): void {
    this.providers.push(provider);
  }

  getProvider(name: string): NotificationProvider | null {
    const provider = this.providers.find((p) => p.name === name);
    return provider || null;
  }

  getAllProviders(): NotificationProvider[] {
    return this.providers;
  }
}

export default new NotificationProviderFactory();
