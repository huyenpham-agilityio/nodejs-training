import { ReminderRepository } from './reminder.repository';
import { Reminder, ReminderStatus } from './entities/Reminder.entity';
import { userRepository } from '@/modules/users/user.repository';
import { MESSAGES } from '@/constants/messages';
import {
  scheduleNotificationJob,
  cancelNotificationJob,
  rescheduleNotificationJob,
} from '@/configs/queue';
import dayjs from 'dayjs';
import logger from '@/configs/logger';
import {
  CreateReminder,
  UpdateReminder,
  UserData,
  PaginatedResult,
  ReminderStats,
} from './reminder.types';

/**
 * Reminder Service
 * Business logic for reminder operations
 */
export class ReminderService {
  private reminderRepository: ReminderRepository;

  constructor(reminderRepository: ReminderRepository) {
    this.reminderRepository = reminderRepository;
  }
  /**
   * Get all reminders for a user with optional filters
   */
  findByUserId = async (
    userId: string,
    search?: string,
    status?: 'active' | 'completed'
  ): Promise<Reminder[]> => {
    return this.reminderRepository.findByUserId(userId, search, status);
  };

  /**
   * Get reminders with pagination
   */
  findByUserIdPaginated = async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: 'active' | 'completed'
  ): Promise<PaginatedResult<Reminder>> => {
    // Validate and sanitize pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    return this.reminderRepository.findByUserIdPaginated(
      userId,
      validPage,
      validLimit,
      search,
      status
    );
  };

  /**
   * Get a specific reminder by ID
   * Throws error if not found or doesn't belong to user
   */
  findById = async (id: number, userId?: string): Promise<Reminder> => {
    const reminder = await this.reminderRepository.findByIdWithUser(id);

    if (!reminder) {
      throw new Error(MESSAGES.REMINDER_NOT_FOUND);
    }

    // Verify ownership if userId is provided
    if (userId && reminder.user.clerk_user_id !== userId) {
      throw new Error(MESSAGES.REMINDER_NOT_FOUND); // Don't expose that it exists
    }

    return reminder;
  };

  /**
   * Create a new reminder
   */
  create = async (
    userId: string,
    reminderData: CreateReminder,
    userData: UserData
  ): Promise<Reminder> => {
    try {
      // Find or create user in database
      const user = await userRepository.findOrCreate(userId, {
        email: userData.email,
        name: userData.name,
      });

      const scheduledAt = dayjs(reminderData.scheduled_at);

      // Create reminder
      const reminder = await this.reminderRepository.create({
        title: reminderData.title,
        description: reminderData.description || '',
        scheduled_at: scheduledAt.toDate(),
        status: ReminderStatus.PENDING,
        user: user,
      });

      // Schedule notification job
      await scheduleNotificationJob(
        {
          reminder_id: reminder.id,
          title: reminder.title,
        },
        reminder.scheduled_at
      );

      logger.info(
        `Reminder created: ID=${reminder.id}, User=${userId}, ScheduledAt=${scheduledAt.format()}`
      );

      return reminder;
    } catch (error) {
      logger.error(`Failed to create reminder for user ${userId}:`, error);
      throw error;
    }
  };

  /**
   * Update a reminder
   */
  update = async (id: number, userId: string, reminderData: UpdateReminder): Promise<Reminder> => {
    try {
      // Verify reminder exists and belongs to user
      const existing = await this.findById(id, userId);

      // Prepare update data
      const updateData: Partial<Reminder> = {};

      if (reminderData.title !== undefined) {
        updateData.title = reminderData.title;
      }

      if (reminderData.description !== undefined) {
        updateData.description = reminderData.description;
      }

      if (reminderData.scheduled_at !== undefined) {
        const newScheduledAt = dayjs(reminderData.scheduled_at);

        // Business rule: Validate that new scheduled time is in the future if reminder is still pending
        if (existing.status === ReminderStatus.PENDING && newScheduledAt.isBefore(dayjs())) {
          throw new Error(MESSAGES.REMINDER_FUTURE_DATE_REQUIRED);
        }

        updateData.scheduled_at = newScheduledAt.toDate();
      }

      // Update reminder in database
      const updated = await this.reminderRepository.update(id, updateData);

      if (!updated) {
        throw new Error(MESSAGES.FAILED_UPDATE_REMINDER);
      }

      // Reschedule notification if scheduled_at was updated and reminder is still pending
      if (reminderData.scheduled_at && updated.status === ReminderStatus.PENDING) {
        await rescheduleNotificationJob(
          {
            reminder_id: updated.id,
            title: updated.title,
          },
          updated.scheduled_at
        );
      }

      logger.info(`Reminder updated: ID=${id}, User=${existing.user.clerk_user_id}`);

      return updated;
    } catch (error) {
      logger.error(`Failed to update reminder ${id}:`, error);
      throw error;
    }
  };

  /**
   * Delete a reminder
   */
  delete = async (id: number, userId: string): Promise<void> => {
    try {
      // Verify reminder exists and belongs to user
      const reminder = await this.findById(id, userId);

      // Cancel scheduled notification job
      await cancelNotificationJob(id);

      // Delete reminder from database
      const deleted = await this.reminderRepository.delete(id);

      if (!deleted) {
        throw new Error(MESSAGES.FAILED_DELETE_REMINDER);
      }

      logger.info(`Reminder deleted: ID=${id}, User=${reminder.user.clerk_user_id}`);
    } catch (error) {
      logger.error(`Failed to delete reminder ${id}:`, error);
      throw error;
    }
  };

  /**
   * Get statistics for a user
   */
  getStats = async (userId: string): Promise<ReminderStats> => {
    return this.reminderRepository.getStatsByUserId(userId);
  };
}
