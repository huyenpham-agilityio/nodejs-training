import {
  NotificationContext,
  NotificationResult,
  NotificationProviderType,
} from '@/modules/notifications/notification.types';
import providerFactory, {
  NotificationProviderFactory,
} from '@/modules/notifications/providers/provider.factory';
import { Reminder } from '@/modules/reminders/entities/Reminder.entity';
import reminderRepository, { ReminderRepository } from '@/modules/reminders/reminder.repository';
import { User } from '@/modules/users/entities/User.entity';

export class NotificationService {
  private providerFactory: NotificationProviderFactory;
  private reminderRepository: ReminderRepository;
  constructor() {
    this.providerFactory = providerFactory;
    this.reminderRepository = reminderRepository;
  }

  // This is a placeholder for the actual implementation
  sendNotification = async (reminder: Reminder, user: User) => {
    console.log(`\n Processing notification for reminder: ${reminder.id}`);

    const context: NotificationContext = {
      reminder_id: reminder.id,
      user_id: user.clerk_user_id,
      user_email: user.email,
      user_name: user.name,
      title: reminder.title,
      description: reminder.description || undefined,
      scheduled_at: reminder.scheduled_at,
    };

    const results: NotificationResult[] = [];

    const allProviders = this.providerFactory.getAllProviders();
    for (const provider of allProviders) {
      // Check if provider is configured
      if (!provider.isConfigured()) {
        console.log(`⊘ Provider ${provider.name} is not configured, skipping`);
        continue;
      }

      // Check user's notification settings
      // Console notifications are always enabled as a fallback
      let shouldSend = false;
      switch (provider.name.toLowerCase()) {
        case NotificationProviderType.EMAIL:
          shouldSend = user.email_notifications_enabled;
          break;
        case NotificationProviderType.SLACK:
          shouldSend = user.slack_notifications_enabled;
          break;
        case NotificationProviderType.CONSOLE:
          shouldSend = true; // Always enabled as fallback
          break;
        default:
          shouldSend = true; // Unknown providers default to enabled
      }

      if (!shouldSend) {
        console.log(`⊘ User has disabled ${provider.name} notifications, skipping`);
        results.push({
          success: true,
          provider: provider.name,
          message: 'Skipped - user preference',
        });
        continue;
      }

      // Send notification
      try {
        await provider.send(context);
        results.push({
          success: true,
          provider: provider.name,
        });
      } catch (error) {
        results.push({
          success: false,
          provider: provider.name,
          error: (error as Error).message,
        });
      }
    }

    const hasSuccessful = results.some((r) => r.success);
    if (hasSuccessful) {
      await this.reminderRepository.markAsNotified(reminder.id);
      console.log(`✓ Reminder ${reminder.id} marked as notified`);
    } else {
      throw new Error(`All notification attempts failed for reminder ${reminder.id}`);
    }
  };

  processReminderNotification = async (reminderId: number): Promise<void> => {
    try {
      const reminder = await this.reminderRepository.findByIdWithUser(reminderId);

      if (!reminder) {
        console.error(`Reminder with ID ${reminderId} not found.`);
        return;
      }

      const user = reminder.user;
      if (!user) {
        console.error(`User for reminder ID ${reminderId} not found.`);
        return;
      }

      await this.sendNotification(reminder, user);
    } catch (error) {
      console.error(`Error processing reminder notification for ID ${reminderId}:`, error);
      throw error;
    }
  };
}

export const notificationService = new NotificationService();
