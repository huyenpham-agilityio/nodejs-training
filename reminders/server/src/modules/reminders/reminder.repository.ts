import { Repository } from 'typeorm';
import AppDataSource from '@/configs/database';
import { Reminder, ReminderStatus } from './entities/Reminder.entity';

/**
 * Reminder Repository
 * Handles database operations for reminders
 */
export class ReminderRepository {
  private repository: Repository<Reminder>;

  constructor() {
    this.repository = AppDataSource.getRepository(Reminder);
  }

  /**
   * Find all reminders for a specific user
   */
  findByUserId = async (userId: string): Promise<Reminder[]> => {
    return this.repository.find({
      where: { user: { clerk_user_id: userId } },
      relations: ['user'],
      order: {
        scheduled_at: 'ASC',
        created_at: 'DESC',
      },
    });
  };

  /**
   * Find a reminder by ID and user ID
   */
  findByIdWithUser = async (id: number): Promise<Reminder | null> => {
    return this.repository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
  };

  /**
   * Create a new reminder
   */
  create = async (reminderData: Partial<Reminder>): Promise<Reminder> => {
    const reminder = this.repository.create(reminderData);
    return this.repository.save(reminder);
  };

  /**
   * Update a reminder
   */
  update = async (id: number, reminderData: Partial<Reminder>): Promise<Reminder | null> => {
    await this.repository.update(id, reminderData);
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  };

  /**
   * Delete a reminder
   */
  delete = async (id: number): Promise<boolean> => {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  };

  markAsNotified = async (id: number): Promise<Reminder | null> => {
    return await this.update(id, {
      status: ReminderStatus.NOTIFIED,
      updated_at: new Date(),
    });
  };

  /**
   * Get statistics for a user
   */
  getStatsByUserId = async (
    userId: string
  ): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  }> => {
    const reminders = await this.findByUserId(userId);

    return {
      total: reminders.length,
      active: reminders.filter((r) => r.status === ReminderStatus.PENDING).length,
      completed: reminders.filter((r) => r.status === ReminderStatus.NOTIFIED).length,
      cancelled: reminders.filter((r) => r.status === ReminderStatus.CANCELLED).length,
    };
  };
}

export default new ReminderRepository();
