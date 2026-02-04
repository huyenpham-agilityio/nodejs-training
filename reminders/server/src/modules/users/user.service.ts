import { UserRepository } from './user.repository';
import { User } from './entities/User.entity';
import { clerkClient } from '@clerk/express';
import { MESSAGES } from '@/constants/messages';
import { UpdateNotificationPreferences } from './user.types';

/**
 * User Service
 * Business logic for user operations
 */
export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  /**
   * Find or create user by Clerk ID
   * This is called when a user accesses the app to ensure they exist in the database
   */
  findOrCreateByClerkId = async (clerkUserId: string): Promise<User> => {
    // First check if user exists in our database
    let user = await this.userRepository.findByClerkUserId(clerkUserId);

    if (user) {
      return user;
    }

    // User doesn't exist, fetch from Clerk and create
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        throw new Error(MESSAGES.USER_EMAIL_NOT_FOUND);
      }

      user = await this.userRepository.create({
        clerk_user_id: clerkUserId,
        email: email,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      });

      return user;
    } catch (error) {
      console.error('Error in findOrCreateByClerkId:', error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      throw new Error(
        `${MESSAGES.FAILED_FETCH_USER_INFO}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  /**
   * Get user by Clerk ID
   */
  findByClerkId = async (clerkUserId: string): Promise<User | null> => {
    return this.userRepository.findByClerkUserId(clerkUserId);
  };

  /**
   * Update user profile
   */
  update = async (clerkUserId: string, userData: Partial<User>): Promise<User> => {
    const user = await this.userRepository.findByClerkUserId(clerkUserId);

    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const updated = await this.userRepository.update(user.id, userData);

    if (!updated) {
      throw new Error(MESSAGES.FAILED_UPDATE_USER);
    }

    return updated;
  };

  /**
   * Update user notification settings
   */
  updateNotificationSettings = async (
    clerkUserId: string,
    settings: UpdateNotificationPreferences
  ): Promise<User> => {
    const user = await this.userRepository.findByClerkUserId(clerkUserId);

    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const updated = await this.userRepository.update(user.id, settings);

    if (!updated) {
      throw new Error(MESSAGES.FAILED_UPDATE_USER);
    }

    return updated;
  };

  /**
   * Get user notification settings
   * Note: Console notifications are always enabled as a fallback, not exposed to users
   */
  getNotificationSettings = async (
    clerkUserId: string
  ): Promise<{
    email_notifications_enabled: boolean;
    slack_notifications_enabled: boolean;
  }> => {
    const user = await this.userRepository.findByClerkUserId(clerkUserId);

    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    return {
      email_notifications_enabled: user.email_notifications_enabled,
      slack_notifications_enabled: user.slack_notifications_enabled,
    };
  };
}
