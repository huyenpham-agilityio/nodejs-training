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
  async findByUserId(userId: string): Promise<Reminder[]> {
    return this.repository.find({
      where: { user: { clerk_user_id: userId } },
      relations: ['user'],
      order: {
        scheduled_at: 'ASC',
        created_at: 'DESC',
      },
    });
  }

  /**
   * Find a reminder by ID and user ID
   */
  async findByIdAndUserId(id: number, userId: string): Promise<Reminder | null> {
    return this.repository.findOne({
      where: {
        id,
        user: { clerk_user_id: userId },
      },
      relations: ['user'],
    });
  }

  /**
   * Create a new reminder
   */
  async create(reminderData: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.repository.create(reminderData);
    return this.repository.save(reminder);
  }

  /**
   * Update a reminder
   */
  async update(id: number, reminderData: Partial<Reminder>): Promise<Reminder | null> {
    await this.repository.update(id, reminderData);
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Delete a reminder
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Toggle reminder completion status
   */
  async toggleComplete(id: number): Promise<Reminder | null> {
    const reminder = await this.repository.findOne({ where: { id } });
    if (!reminder) return null;

    reminder.is_completed = !reminder.is_completed;
    reminder.status = reminder.is_completed ? ReminderStatus.COMPLETED : ReminderStatus.PENDING;

    return this.repository.save(reminder);
  }

  /**
   * Get statistics for a user
   */
  async getStatsByUserId(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
  }> {
    const reminders = await this.findByUserId(userId);
    const now = new Date();

    return {
      total: reminders.length,
      active: reminders.filter((r) => !r.is_completed).length,
      completed: reminders.filter((r) => r.is_completed).length,
      overdue: reminders.filter((r) => !r.is_completed && new Date(r.scheduled_at) < now).length,
    };
  }
}
