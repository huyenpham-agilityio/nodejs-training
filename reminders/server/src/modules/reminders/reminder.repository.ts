import { Repository } from 'typeorm';
import AppDataSource from '@/configs/database';
import { Reminder, ReminderStatus } from './entities/Reminder.entity';
import dayjs from 'dayjs';

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
   * Find all reminders for a specific user with optional filters
   * If no filters provided, returns all reminders
   */
  findByUserId = async (
    userId: string,
    search?: string,
    status?: 'active' | 'completed'
  ): Promise<Reminder[]> => {
    const queryBuilder = this.repository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .where('user.clerk_user_id = :userId', { userId });

    // Apply status filter if provided
    if (status === 'active') {
      queryBuilder.andWhere('reminder.status = :status', { status: ReminderStatus.PENDING });
    } else if (status === 'completed') {
      queryBuilder.andWhere('reminder.status = :status', { status: ReminderStatus.NOTIFIED });
    }

    // Apply search filter if provided (case-insensitive)
    if (search && search.trim()) {
      queryBuilder.andWhere(
        '(LOWER(reminder.title) LIKE LOWER(:search) OR LOWER(reminder.description) LIKE LOWER(:search))',
        {
          search: `%${search}%`,
        }
      );
    }

    // Order by status, scheduled_at, and created_at
    queryBuilder
      .orderBy('reminder.status', 'ASC') // PENDING first
      .addOrderBy('reminder.scheduled_at', 'ASC')
      .addOrderBy('reminder.created_at', 'DESC');

    return queryBuilder.getMany();
  };

  /**
   * Find reminders for a user with pagination
   */
  findByUserIdPaginated = async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: 'active' | 'completed'
  ): Promise<{ reminders: Reminder[]; total: number }> => {
    const queryBuilder = this.repository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .where('user.clerk_user_id = :userId', { userId });

    // Apply status filter if provided
    if (status === 'active') {
      queryBuilder.andWhere('reminder.status = :status', { status: ReminderStatus.PENDING });
    } else if (status === 'completed') {
      queryBuilder.andWhere('reminder.status = :status', { status: ReminderStatus.NOTIFIED });
    }

    // Apply search filter if provided (case-insensitive)
    if (search && search.trim()) {
      queryBuilder.andWhere(
        '(LOWER(reminder.title) LIKE LOWER(:search) OR LOWER(reminder.description) LIKE LOWER(:search))',
        {
          search: `%${search}%`,
        }
      );
    }

    // Order by status, scheduled_at, and created_at
    queryBuilder
      .orderBy('reminder.status', 'ASC') // PENDING first
      .addOrderBy('reminder.scheduled_at', 'ASC')
      .addOrderBy('reminder.created_at', 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const reminders = await queryBuilder.getMany();

    return { reminders, total };
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
      updated_at: dayjs().toDate(),
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
  }> => {
    const reminders = await this.findByUserId(userId);

    return {
      total: reminders.length,
      active: reminders.filter((r) => r.status === ReminderStatus.PENDING).length,
      completed: reminders.filter((r) => r.status === ReminderStatus.NOTIFIED).length,
    };
  };
}

export default new ReminderRepository();
