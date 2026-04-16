import { Repository } from 'typeorm';
import AppDataSource from '@/configs/database';
import { User } from './entities/User.entity';

/**
 * User Repository
 * Handles database operations for users
 */
export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Find user by Clerk user ID
   */
  findByClerkUserId = async (clerkUserId: string): Promise<User | null> => {
    return this.repository.findOne({
      where: { clerk_user_id: clerkUserId },
    });
  };

  /**
   * Find user by ID
   */
  findById = async (id: number): Promise<User | null> => {
    return this.repository.findOne({
      where: { id },
    });
  };

  /**
   * Create a new user
   */
  create = async (userData: Partial<User>): Promise<User> => {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  };

  /**
   * Update a user
   */
  update = async (id: number, userData: Partial<User>): Promise<User | null> => {
    await this.repository.update(id, userData);
    return this.repository.findOne({
      where: { id },
    });
  };

  /**
   * Find or create user by Clerk ID
   */
  findOrCreate = async (clerkUserId: string, userData: Partial<User>): Promise<User> => {
    let user = await this.findByClerkUserId(clerkUserId);

    if (!user) {
      user = await this.create({
        clerk_user_id: clerkUserId,
        ...userData,
      });
    }

    return user;
  };
}

export const userRepository = new UserRepository();
