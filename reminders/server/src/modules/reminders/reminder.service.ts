import { ReminderRepository } from './reminder.repository';
import { Reminder, ReminderStatus } from './entities/Reminder.entity';
import { userRepository } from '@/modules/users/user.repository';
import { clerkClient } from '@clerk/express';
import {
  scheduleNotificationJob,
  cancelNotificationJob,
  rescheduleNotificationJob,
} from '@/configs/queue';
import dayjs from 'dayjs';

export interface CreateReminderDTO {
  title: string;
  description?: string;
  scheduled_at: Date | string;
}

export interface UpdateReminderDTO {
  title?: string;
  description?: string;
  scheduled_at?: Date | string;
}

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
   * Get all reminders for a user
   */
  async findByUserId(userId: string): Promise<Reminder[]> {
    return this.reminderRepository.findByUserId(userId);
  }

  /**
   * Get a specific reminder by ID
   * Throws error if not found or doesn't belong to user
   */
  async findById(id: number): Promise<Reminder> {
    const reminder = await this.reminderRepository.findByIdWithUser(id);

    if (!reminder) {
      throw new Error('Reminder not found or access denied');
    }

    return reminder;
  }

  /**
   * Create a new reminder
   */
  async create(userId: string, reminderData: CreateReminderDTO): Promise<Reminder> {
    // Validate required fields
    if (!reminderData.title || !reminderData.scheduled_at) {
      throw new Error('Title and scheduled_at are required');
    }

    // Get user info from Clerk
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.getUser(userId);
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      throw new Error('Failed to fetch user information');
    }

    // Find or create user in database
    const user = await userRepository.findOrCreate(userId, {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
    });

    // Validate scheduled time is in the future
    const scheduledAt = dayjs(reminderData.scheduled_at);

    if (scheduledAt.isBefore(dayjs()) || scheduledAt.isSame(dayjs())) {
      throw new Error('scheduled_at must be a future date and time');
    }

    // Create reminder
    const reminder = await this.reminderRepository.create({
      title: reminderData.title,
      description: reminderData.description || '',
      scheduled_at: scheduledAt.toDate(),
      status: ReminderStatus.PENDING,
      user: user,
    });

    await scheduleNotificationJob(
      {
        reminder_id: reminder.id,
        title: reminder.title,
      },
      reminder.scheduled_at
    );

    return reminder;
  }

  /**
   * Update a reminder
   */
  async update(id: number, reminderData: UpdateReminderDTO): Promise<Reminder> {
    // Verify ownership
    const existing = await this.findById(id);

    if (!existing) {
      throw new Error('Reminder not found or access denied');
    }

    // Prepare update data
    const updateData: Partial<Reminder> = {};

    if (reminderData.title !== undefined) {
      updateData.title = reminderData.title;
    }

    if (reminderData.description !== undefined) {
      updateData.description = reminderData.description;
    }

    if (reminderData.scheduled_at !== undefined) {
      const newScheduledAt = dayjs(
        typeof reminderData.scheduled_at === 'string'
          ? reminderData.scheduled_at
          : reminderData.scheduled_at
      );

      // Validate that new scheduled time is in the future if reminder is still pending
      if (existing.status === ReminderStatus.PENDING && newScheduledAt.isBefore(dayjs())) {
        throw new Error('scheduled_at must be a future date and time');
      }

      updateData.scheduled_at = newScheduledAt.toDate();
    }

    // Update reminder
    const updated = await this.reminderRepository.update(id, updateData);

    if (!updated) {
      throw new Error('Failed to update reminder');
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
      console.log(
        `Rescheduled notification for reminder ID ${id} to ${dayjs(updated.scheduled_at).toISOString()}`
      );
    }

    return updated;
  }

  /**
   * Delete a reminder
   */
  async delete(id: number): Promise<void> {
    // Verify ownership
    await this.findById(id);

    // Cancel scheduled notification job if exists
    await cancelNotificationJob(id);

    const deleted = await this.reminderRepository.delete(id);

    if (!deleted) {
      throw new Error('Failed to delete reminder');
    }
  }

  /**
   * Get statistics for a user
   */
  async getStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  }> {
    return this.reminderRepository.getStatsByUserId(userId);
  }
}
