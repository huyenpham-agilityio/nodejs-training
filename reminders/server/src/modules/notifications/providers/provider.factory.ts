import { NotificationProvider } from './notification.provider';
import { ConsoleNotificationProvider } from './console.provider';

const consoleProvider = new ConsoleNotificationProvider();

export class NotificationProviderFactory {
  providers: NotificationProvider[] = [];

  constructor() {
    // Register available providers here
    this.providers.push(consoleProvider);
  }

  register = (provider: NotificationProvider) => {
    this.providers.push(provider);
  };

  getProvider = (name: string): NotificationProvider | null => {
    const provider = this.providers.find((p) => p.name === name);
    return provider || null;
  };

  getAllProviders = (): NotificationProvider[] => {
    return this.providers;
  };
}

export default new NotificationProviderFactory();
