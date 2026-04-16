import { NotificationService } from '@/modules/notifications/notification.services';
import { NotificationProvider } from '@/modules/notifications/providers/notification.provider';
import { Reminder, ReminderStatus } from '@/modules/reminders/entities/Reminder.entity';
import { User } from '@/modules/users/entities/User.entity';
import { NotificationContext, NotificationProviderType } from '@/modules/notifications/notification.types';
import dayjs from 'dayjs';

jest.mock('@/modules/notifications/providers/provider.factory', () => ({
  __esModule: true,
  NotificationProviderFactory: jest.fn(),
  default: { getAllProviders: jest.fn(), initialize: jest.fn(), register: jest.fn(), getProvider: jest.fn() },
}));

jest.mock('@/modules/reminders/reminder.repository', () => ({
  __esModule: true,
  ReminderRepository: jest.fn(),
  default: { findByIdWithUser: jest.fn(), markAsNotified: jest.fn(), markAsCancelled: jest.fn() },
}));

jest.mock('@/configs/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    clerk_user_id: 'user_clerk_123',
    name: 'Test User',
    email: 'test@example.com',
    email_notifications_enabled: true,
    slack_notifications_enabled: true,
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

const makeProvider = (
  name: string,
  configured = true,
  sendFn?: jest.Mock
): NotificationProvider => {
  const sendMock = sendFn ?? (jest.fn().mockResolvedValue(undefined) as jest.Mock);
  return {
    name,
    isConfigured: jest.fn().mockReturnValue(configured),
    send: sendMock,
    log: jest.fn(),
  } as unknown as NotificationProvider;
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
describe('NotificationService', () => {
  let service: NotificationService;
  let mockProviderFactory: { getAllProviders: jest.Mock; initialize: jest.Mock };
  let mockReminderRepo: { findByIdWithUser: jest.Mock; markAsNotified: jest.Mock; markAsCancelled: jest.Mock };

  beforeEach(() => {
    mockProviderFactory = {
      getAllProviders: jest.fn(),
      initialize: jest.fn(),
    };
    mockReminderRepo = {
      findByIdWithUser: jest.fn(),
      markAsNotified: jest.fn(),
      markAsCancelled: jest.fn(),
    };

    service = new NotificationService();
    // Inject mock dependencies directly into the service instance
    (service as any).providerFactory = mockProviderFactory;
    (service as any).reminderRepository = mockReminderRepo;
  });

  // ---------------------------------------------------------------------------
  // sendNotification
  // ---------------------------------------------------------------------------
  describe('sendNotification', () => {
    it('sends to all configured providers respecting user preferences', async () => {
      const user = makeUser({ email_notifications_enabled: true, slack_notifications_enabled: true });
      const reminder = makeReminder({ user });

      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE);
      const emailProvider = makeProvider(NotificationProviderType.EMAIL);
      const slackProvider = makeProvider(NotificationProviderType.SLACK);

      mockProviderFactory.getAllProviders.mockReturnValue([consoleProvider, emailProvider, slackProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      expect(consoleProvider.send).toHaveBeenCalled();
      expect(emailProvider.send).toHaveBeenCalled();
      expect(slackProvider.send).toHaveBeenCalled();
      expect(mockReminderRepo.markAsNotified).toHaveBeenCalledWith(reminder.id);
    });

    it('skips email provider when user has email notifications disabled', async () => {
      const user = makeUser({ email_notifications_enabled: false });
      const reminder = makeReminder({ user });

      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE);
      const emailProvider = makeProvider(NotificationProviderType.EMAIL);

      mockProviderFactory.getAllProviders.mockReturnValue([consoleProvider, emailProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      expect(emailProvider.send).not.toHaveBeenCalled();
      expect(consoleProvider.send).toHaveBeenCalled();
    });

    it('skips slack provider when user has slack notifications disabled', async () => {
      const user = makeUser({ slack_notifications_enabled: false });
      const reminder = makeReminder({ user });

      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE);
      const slackProvider = makeProvider(NotificationProviderType.SLACK);

      mockProviderFactory.getAllProviders.mockReturnValue([consoleProvider, slackProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      expect(slackProvider.send).not.toHaveBeenCalled();
    });

    it('always sends console notification regardless of user preferences', async () => {
      const user = makeUser({ email_notifications_enabled: false, slack_notifications_enabled: false });
      const reminder = makeReminder({ user });

      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE);
      mockProviderFactory.getAllProviders.mockReturnValue([consoleProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      expect(consoleProvider.send).toHaveBeenCalled();
      expect(mockReminderRepo.markAsNotified).toHaveBeenCalled();
    });

    it('skips providers that are not configured', async () => {
      const user = makeUser();
      const reminder = makeReminder({ user });

      const unconfiguredEmail = makeProvider(NotificationProviderType.EMAIL, false);
      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE, true);

      mockProviderFactory.getAllProviders.mockReturnValue([unconfiguredEmail, consoleProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      expect(unconfiguredEmail.send).not.toHaveBeenCalled();
      expect(consoleProvider.send).toHaveBeenCalled();
    });

    it('marks reminder as notified when at least one provider succeeds', async () => {
      const user = makeUser();
      const reminder = makeReminder({ user });

      const failingEmail = makeProvider(
        NotificationProviderType.EMAIL,
        true,
        jest.fn().mockRejectedValue(new Error('SMTP error'))
      );
      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE);

      mockProviderFactory.getAllProviders.mockReturnValue([failingEmail, consoleProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      expect(mockReminderRepo.markAsNotified).toHaveBeenCalledWith(reminder.id);
    });

    it('throws when all providers fail', async () => {
      const user = makeUser();
      const reminder = makeReminder({ user });

      const failingConsole = makeProvider(
        NotificationProviderType.CONSOLE,
        true,
        jest.fn().mockRejectedValue(new Error('Console error'))
      );

      mockProviderFactory.getAllProviders.mockReturnValue([failingConsole]);

      await expect(service.sendNotification(reminder, user)).rejects.toThrow(
        `All notification attempts failed for reminder ${reminder.id}`
      );
      expect(mockReminderRepo.markAsNotified).not.toHaveBeenCalled();
    });

    it('passes correct context to providers', async () => {
      const user = makeUser();
      const reminder = makeReminder({ user });
      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE);

      mockProviderFactory.getAllProviders.mockReturnValue([consoleProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      const expectedContext: NotificationContext = {
        reminder_id: reminder.id,
        user_id: user.clerk_user_id,
        user_email: user.email,
        user_name: user.name,
        title: reminder.title,
        description: reminder.description || undefined,
        scheduled_at: reminder.scheduled_at,
      };
      expect(consoleProvider.send).toHaveBeenCalledWith(expectedContext);
    });

    it('treats unknown provider names as enabled by default', async () => {
      const user = makeUser();
      const reminder = makeReminder({ user });
      const unknownProvider = makeProvider('sms');

      mockProviderFactory.getAllProviders.mockReturnValue([unknownProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.sendNotification(reminder, user);

      expect(unknownProvider.send).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // processReminderNotification
  // ---------------------------------------------------------------------------
  describe('processReminderNotification', () => {
    it('fetches reminder by ID and sends notification', async () => {
      const user = makeUser();
      const reminder = makeReminder({ user });
      mockReminderRepo.findByIdWithUser.mockResolvedValue(reminder);

      const consoleProvider = makeProvider(NotificationProviderType.CONSOLE);
      mockProviderFactory.getAllProviders.mockReturnValue([consoleProvider]);
      mockReminderRepo.markAsNotified.mockResolvedValue(reminder);

      await service.processReminderNotification(1);

      expect(mockReminderRepo.findByIdWithUser).toHaveBeenCalledWith(1);
      expect(consoleProvider.send).toHaveBeenCalled();
    });

    it('returns early without error when reminder is not found', async () => {
      mockReminderRepo.findByIdWithUser.mockResolvedValue(null);

      await expect(service.processReminderNotification(999)).resolves.toBeUndefined();
      expect(mockProviderFactory.getAllProviders).not.toHaveBeenCalled();
    });

    it('returns early when reminder has no associated user', async () => {
      const reminderWithoutUser = makeReminder({ user: null as unknown as User });
      mockReminderRepo.findByIdWithUser.mockResolvedValue(reminderWithoutUser);

      await expect(service.processReminderNotification(1)).resolves.toBeUndefined();
    });

    it('propagates errors from sendNotification', async () => {
      const user = makeUser();
      const reminder = makeReminder({ user });
      mockReminderRepo.findByIdWithUser.mockResolvedValue(reminder);

      const failingProvider = makeProvider(
        NotificationProviderType.CONSOLE,
        true,
        jest.fn().mockRejectedValue(new Error('Critical failure'))
      );
      mockProviderFactory.getAllProviders.mockReturnValue([failingProvider]);

      await expect(service.processReminderNotification(1)).rejects.toThrow(
        `All notification attempts failed for reminder ${reminder.id}`
      );
    });
  });
});
