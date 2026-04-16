import { UserService } from '@/modules/users/user.service';
import { UserRepository } from '@/modules/users/user.repository';
import { User } from '@/modules/users/entities/User.entity';
import { MESSAGES } from '@/constants/messages';

// Mock Clerk client
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock('@/configs/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { clerkClient } from '@clerk/express';

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    clerk_user_id: 'user_clerk_123',
    name: 'Test User',
    email: 'test@example.com',
    email_notifications_enabled: true,
    slack_notifications_enabled: false,
    console_notifications_enabled: true,
    reminders: [],
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }) as User;

describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      findByClerkUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findOrCreate: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    service = new UserService(mockRepo);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // findOrCreateByClerkId
  // ---------------------------------------------------------------------------
  describe('findOrCreateByClerkId', () => {
    it('returns existing user when found in database', async () => {
      const user = makeUser();
      mockRepo.findByClerkUserId.mockResolvedValue(user);

      const result = await service.findOrCreateByClerkId('user_clerk_123');

      expect(mockRepo.findByClerkUserId).toHaveBeenCalledWith('user_clerk_123');
      expect(clerkClient.users.getUser).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('fetches from Clerk and creates user when not in database', async () => {
      const newUser = makeUser();
      mockRepo.findByClerkUserId.mockResolvedValue(null);
      (clerkClient.users.getUser as jest.Mock).mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
      });
      mockRepo.create.mockResolvedValue(newUser);

      const result = await service.findOrCreateByClerkId('user_clerk_123');

      expect(clerkClient.users.getUser).toHaveBeenCalledWith('user_clerk_123');
      expect(mockRepo.create).toHaveBeenCalledWith({
        clerk_user_id: 'user_clerk_123',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result).toEqual(newUser);
    });

    it('uses "User" as name fallback when Clerk has no first/last name', async () => {
      const newUser = makeUser({ name: 'User' });
      mockRepo.findByClerkUserId.mockResolvedValue(null);
      (clerkClient.users.getUser as jest.Mock).mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: null,
        lastName: null,
      });
      mockRepo.create.mockResolvedValue(newUser);

      await service.findOrCreateByClerkId('user_clerk_123');

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'User' })
      );
    });

    it('throws when Clerk user has no email address', async () => {
      mockRepo.findByClerkUserId.mockResolvedValue(null);
      (clerkClient.users.getUser as jest.Mock).mockResolvedValue({
        emailAddresses: [],
        firstName: 'Test',
        lastName: 'User',
      });

      await expect(service.findOrCreateByClerkId('user_clerk_123')).rejects.toThrow(
        MESSAGES.FAILED_FETCH_USER_INFO
      );
    });

    it('wraps Clerk errors with FAILED_FETCH_USER_INFO prefix', async () => {
      mockRepo.findByClerkUserId.mockResolvedValue(null);
      (clerkClient.users.getUser as jest.Mock).mockRejectedValue(new Error('Clerk API error'));

      await expect(service.findOrCreateByClerkId('user_clerk_123')).rejects.toThrow(
        MESSAGES.FAILED_FETCH_USER_INFO
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findByClerkId
  // ---------------------------------------------------------------------------
  describe('findByClerkId', () => {
    it('returns user when found', async () => {
      const user = makeUser();
      mockRepo.findByClerkUserId.mockResolvedValue(user);

      const result = await service.findByClerkId('user_clerk_123');

      expect(result).toEqual(user);
    });

    it('returns null when user not found', async () => {
      mockRepo.findByClerkUserId.mockResolvedValue(null);

      const result = await service.findByClerkId('user_clerk_999');

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('updates user successfully', async () => {
      const user = makeUser();
      const updatedUser = makeUser({ name: 'New Name' });
      mockRepo.findByClerkUserId.mockResolvedValue(user);
      mockRepo.update.mockResolvedValue(updatedUser);

      const result = await service.update('user_clerk_123', { name: 'New Name' });

      expect(mockRepo.update).toHaveBeenCalledWith(user.id, { name: 'New Name' });
      expect(result).toEqual(updatedUser);
    });

    it('throws USER_NOT_FOUND when user does not exist', async () => {
      mockRepo.findByClerkUserId.mockResolvedValue(null);

      await expect(service.update('user_clerk_999', { name: 'New Name' })).rejects.toThrow(
        MESSAGES.USER_NOT_FOUND
      );
    });

    it('throws FAILED_UPDATE_USER when repository returns null', async () => {
      const user = makeUser();
      mockRepo.findByClerkUserId.mockResolvedValue(user);
      mockRepo.update.mockResolvedValue(null);

      await expect(service.update('user_clerk_123', { name: 'New Name' })).rejects.toThrow(
        MESSAGES.FAILED_UPDATE_USER
      );
    });
  });

  // ---------------------------------------------------------------------------
  // updateNotificationSettings
  // ---------------------------------------------------------------------------
  describe('updateNotificationSettings', () => {
    it('updates notification settings successfully', async () => {
      const user = makeUser();
      const updatedUser = makeUser({ email_notifications_enabled: false });
      mockRepo.findByClerkUserId.mockResolvedValue(user);
      mockRepo.update.mockResolvedValue(updatedUser);

      const result = await service.updateNotificationSettings('user_clerk_123', {
        email_notifications_enabled: false,
      });

      expect(mockRepo.update).toHaveBeenCalledWith(user.id, {
        email_notifications_enabled: false,
      });
      expect(result).toEqual(updatedUser);
    });

    it('throws USER_NOT_FOUND when user does not exist', async () => {
      mockRepo.findByClerkUserId.mockResolvedValue(null);

      await expect(
        service.updateNotificationSettings('user_clerk_999', { email_notifications_enabled: true })
      ).rejects.toThrow(MESSAGES.USER_NOT_FOUND);
    });

    it('throws FAILED_UPDATE_USER when update fails', async () => {
      const user = makeUser();
      mockRepo.findByClerkUserId.mockResolvedValue(user);
      mockRepo.update.mockResolvedValue(null);

      await expect(
        service.updateNotificationSettings('user_clerk_123', { slack_notifications_enabled: true })
      ).rejects.toThrow(MESSAGES.FAILED_UPDATE_USER);
    });
  });

  // ---------------------------------------------------------------------------
  // getNotificationSettings
  // ---------------------------------------------------------------------------
  describe('getNotificationSettings', () => {
    it('returns notification settings for existing user', async () => {
      const user = makeUser({ email_notifications_enabled: true, slack_notifications_enabled: false });
      mockRepo.findByClerkUserId.mockResolvedValue(user);

      const result = await service.getNotificationSettings('user_clerk_123');

      expect(result).toEqual({
        email_notifications_enabled: true,
        slack_notifications_enabled: false,
      });
    });

    it('throws USER_NOT_FOUND when user does not exist', async () => {
      mockRepo.findByClerkUserId.mockResolvedValue(null);

      await expect(service.getNotificationSettings('user_clerk_999')).rejects.toThrow(
        MESSAGES.USER_NOT_FOUND
      );
    });

    it('does not include console_notifications_enabled in returned settings', async () => {
      const user = makeUser({ console_notifications_enabled: true });
      mockRepo.findByClerkUserId.mockResolvedValue(user);

      const result = await service.getNotificationSettings('user_clerk_123');

      expect(result).not.toHaveProperty('console_notifications_enabled');
    });
  });
});
