import { ReminderService } from '@/modules/reminders/reminder.service';
import { ReminderRepository } from '@/modules/reminders/reminder.repository';
import { userRepository } from '@/modules/users/user.repository';
import { Reminder, ReminderStatus } from '@/modules/reminders/entities/Reminder.entity';
import { User } from '@/modules/users/entities/User.entity';
import { MESSAGES } from '@/constants/messages';
import {
  scheduleNotificationJob,
  cancelNotificationJob,
  rescheduleNotificationJob,
} from '@/configs/queue';
import dayjs from 'dayjs';

// Mock external dependencies
jest.mock('@/modules/users/user.repository', () => ({
  userRepository: {
    findOrCreate: jest.fn(),
  },
}));

jest.mock('@/configs/queue', () => ({
  scheduleNotificationJob: jest.fn(),
  cancelNotificationJob: jest.fn(),
  rescheduleNotificationJob: jest.fn(),
}));

jest.mock('@/configs/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Helpers
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

const makeReminder = (overrides: Partial<Reminder> = {}): Reminder =>
  ({
    id: 1,
    title: 'Test Reminder',
    description: 'Test description',
    scheduled_at: dayjs().add(1, 'day').toDate(),
    status: ReminderStatus.PENDING,
    user: makeUser(),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }) as Reminder;

describe('ReminderService', () => {
  let service: ReminderService;
  let mockRepo: jest.Mocked<ReminderRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      findByUserIdPaginated: jest.fn(),
      findByIdWithUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      markAsNotified: jest.fn(),
      markAsCancelled: jest.fn(),
      getStatsByUserId: jest.fn(),
    } as unknown as jest.Mocked<ReminderRepository>;

    service = new ReminderService(mockRepo);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // findByUserId
  // ---------------------------------------------------------------------------
  describe('findByUserId', () => {
    it('returns reminders from repository', async () => {
      const reminders = [makeReminder(), makeReminder({ id: 2, title: 'Another' })];
      mockRepo.findByUserId.mockResolvedValue(reminders);

      const result = await service.findByUserId('user_clerk_123');

      expect(mockRepo.findByUserId).toHaveBeenCalledWith('user_clerk_123', undefined, undefined);
      expect(result).toEqual(reminders);
    });

    it('passes search and status filters to repository', async () => {
      mockRepo.findByUserId.mockResolvedValue([]);

      await service.findByUserId('user_clerk_123', 'meeting', 'active');

      expect(mockRepo.findByUserId).toHaveBeenCalledWith('user_clerk_123', 'meeting', 'active');
    });
  });

  // ---------------------------------------------------------------------------
  // findByUserIdPaginated
  // ---------------------------------------------------------------------------
  describe('findByUserIdPaginated', () => {
    it('returns paginated reminders', async () => {
      const paginatedResult = { reminders: [makeReminder()], total: 1 };
      mockRepo.findByUserIdPaginated.mockResolvedValue(paginatedResult);

      const result = await service.findByUserIdPaginated('user_clerk_123', 1, 10);

      expect(mockRepo.findByUserIdPaginated).toHaveBeenCalledWith(
        'user_clerk_123',
        1,
        10,
        undefined,
        undefined
      );
      expect(result).toEqual(paginatedResult);
    });

    it('clamps page to minimum 1', async () => {
      mockRepo.findByUserIdPaginated.mockResolvedValue({ reminders: [], total: 0 });

      await service.findByUserIdPaginated('user_clerk_123', -5, 10);

      expect(mockRepo.findByUserIdPaginated).toHaveBeenCalledWith(
        'user_clerk_123',
        1,
        10,
        undefined,
        undefined
      );
    });

    it('clamps limit to maximum 100', async () => {
      mockRepo.findByUserIdPaginated.mockResolvedValue({ reminders: [], total: 0 });

      await service.findByUserIdPaginated('user_clerk_123', 1, 999);

      expect(mockRepo.findByUserIdPaginated).toHaveBeenCalledWith(
        'user_clerk_123',
        1,
        100,
        undefined,
        undefined
      );
    });

    it('clamps limit to minimum 1', async () => {
      mockRepo.findByUserIdPaginated.mockResolvedValue({ reminders: [], total: 0 });

      await service.findByUserIdPaginated('user_clerk_123', 1, 0);

      expect(mockRepo.findByUserIdPaginated).toHaveBeenCalledWith(
        'user_clerk_123',
        1,
        1,
        undefined,
        undefined
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findById
  // ---------------------------------------------------------------------------
  describe('findById', () => {
    it('returns reminder when found and owned by user', async () => {
      const reminder = makeReminder();
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);

      const result = await service.findById(1, 'user_clerk_123');

      expect(result).toEqual(reminder);
    });

    it('throws REMINDER_NOT_FOUND when reminder does not exist', async () => {
      mockRepo.findByIdWithUser.mockResolvedValue(null);

      await expect(service.findById(999, 'user_clerk_123')).rejects.toThrow(
        MESSAGES.REMINDER_NOT_FOUND
      );
    });

    it('throws REMINDER_NOT_FOUND when reminder belongs to different user', async () => {
      const reminder = makeReminder({ user: makeUser({ clerk_user_id: 'other_user' }) });
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);

      await expect(service.findById(1, 'user_clerk_123')).rejects.toThrow(
        MESSAGES.REMINDER_NOT_FOUND
      );
    });

    it('returns reminder without ownership check when userId is not provided', async () => {
      const reminder = makeReminder();
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);

      const result = await service.findById(1);

      expect(result).toEqual(reminder);
    });
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const reminderData = {
      title: 'New Reminder',
      description: 'Test',
      scheduled_at: dayjs().add(1, 'hour').toDate(),
    };

    it('creates a reminder successfully and schedules a notification job', async () => {
      const user = makeUser();
      const reminder = makeReminder({ title: 'New Reminder' });
      (userRepository.findOrCreate as jest.Mock).mockResolvedValue(user);
      mockRepo.create.mockResolvedValue(reminder);
      (scheduleNotificationJob as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create('user_clerk_123', reminderData, userData);

      expect(userRepository.findOrCreate).toHaveBeenCalledWith('user_clerk_123', {
        email: userData.email,
        name: userData.name,
      });
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Reminder',
          status: ReminderStatus.PENDING,
          user,
        })
      );
      expect(scheduleNotificationJob).toHaveBeenCalledWith(
        { reminder_id: reminder.id, title: reminder.title },
        reminder.scheduled_at
      );
      expect(result).toEqual(reminder);
    });

    it('throws when user creation fails', async () => {
      (userRepository.findOrCreate as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.create('user_clerk_123', reminderData, userData)).rejects.toThrow(
        'DB error'
      );
    });

    it('throws when notification scheduling fails', async () => {
      const user = makeUser();
      const reminder = makeReminder();
      (userRepository.findOrCreate as jest.Mock).mockResolvedValue(user);
      mockRepo.create.mockResolvedValue(reminder);
      (scheduleNotificationJob as jest.Mock).mockRejectedValue(new Error('Queue error'));

      await expect(service.create('user_clerk_123', reminderData, userData)).rejects.toThrow(
        'Queue error'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('updates title only', async () => {
      const reminder = makeReminder();
      const updated = makeReminder({ title: 'Updated Title' });
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(1, 'user_clerk_123', { title: 'Updated Title' });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { title: 'Updated Title' });
      expect(result).toEqual(updated);
      expect(rescheduleNotificationJob).not.toHaveBeenCalled();
    });

    it('updates scheduled_at and reschedules notification for PENDING reminder', async () => {
      const newDate = dayjs().add(2, 'days').toDate();
      const reminder = makeReminder();
      const updated = makeReminder({ scheduled_at: newDate });
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);
      mockRepo.update.mockResolvedValue(updated);
      (rescheduleNotificationJob as jest.Mock).mockResolvedValue(undefined);

      await service.update(1, 'user_clerk_123', { scheduled_at: newDate });

      expect(rescheduleNotificationJob).toHaveBeenCalledWith(
        { reminder_id: updated.id, title: updated.title },
        updated.scheduled_at
      );
    });

    it('throws when new scheduled_at is in the past for PENDING reminder', async () => {
      const reminder = makeReminder();
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);

      const pastDate = dayjs().subtract(1, 'hour').toDate();

      await expect(
        service.update(1, 'user_clerk_123', { scheduled_at: pastDate })
      ).rejects.toThrow(MESSAGES.REMINDER_FUTURE_DATE_REQUIRED);
    });

    it('does not reschedule for non-PENDING reminder when scheduled_at changes', async () => {
      const notifiedReminder = makeReminder({ status: ReminderStatus.NOTIFIED });
      const pastDate = dayjs().subtract(1, 'hour').toDate();
      const updated = makeReminder({ status: ReminderStatus.NOTIFIED, scheduled_at: pastDate });
      mockRepo.findByIdWithUser.mockResolvedValue(notifiedReminder);
      mockRepo.update.mockResolvedValue(updated);

      await service.update(1, 'user_clerk_123', { scheduled_at: pastDate });

      expect(rescheduleNotificationJob).not.toHaveBeenCalled();
    });

    it('throws REMINDER_NOT_FOUND when reminder does not belong to user', async () => {
      mockRepo.findByIdWithUser.mockResolvedValue(null);

      await expect(
        service.update(1, 'user_clerk_123', { title: 'New' })
      ).rejects.toThrow(MESSAGES.REMINDER_NOT_FOUND);
    });

    it('throws FAILED_UPDATE_REMINDER when repository returns null', async () => {
      const reminder = makeReminder();
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);
      mockRepo.update.mockResolvedValue(null);

      await expect(
        service.update(1, 'user_clerk_123', { title: 'New' })
      ).rejects.toThrow(MESSAGES.FAILED_UPDATE_REMINDER);
    });
  });

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------
  describe('delete', () => {
    it('deletes reminder and cancels notification job', async () => {
      const reminder = makeReminder();
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);
      (cancelNotificationJob as jest.Mock).mockResolvedValue(undefined);
      mockRepo.delete.mockResolvedValue(true);

      await service.delete(1, 'user_clerk_123');

      expect(cancelNotificationJob).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('throws REMINDER_NOT_FOUND when reminder does not belong to user', async () => {
      mockRepo.findByIdWithUser.mockResolvedValue(null);

      await expect(service.delete(1, 'user_clerk_123')).rejects.toThrow(
        MESSAGES.REMINDER_NOT_FOUND
      );
    });

    it('throws FAILED_DELETE_REMINDER when delete returns false', async () => {
      const reminder = makeReminder();
      mockRepo.findByIdWithUser.mockResolvedValue(reminder);
      (cancelNotificationJob as jest.Mock).mockResolvedValue(undefined);
      mockRepo.delete.mockResolvedValue(false);

      await expect(service.delete(1, 'user_clerk_123')).rejects.toThrow(
        MESSAGES.FAILED_DELETE_REMINDER
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getStats
  // ---------------------------------------------------------------------------
  describe('getStats', () => {
    it('returns stats from repository', async () => {
      const stats = { total: 10, active: 5, completed: 5 };
      mockRepo.getStatsByUserId.mockResolvedValue(stats);

      const result = await service.getStats('user_clerk_123');

      expect(mockRepo.getStatsByUserId).toHaveBeenCalledWith('user_clerk_123');
      expect(result).toEqual(stats);
    });
  });
});
