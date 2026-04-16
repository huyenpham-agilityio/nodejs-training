import { Request, Response } from 'express';
import { ReminderController } from '@/modules/reminders/reminder.controller';
import { ReminderService } from '@/modules/reminders/reminder.service';
import { Reminder, ReminderStatus } from '@/modules/reminders/entities/Reminder.entity';
import { User } from '@/modules/users/entities/User.entity';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';
import dayjs from 'dayjs';

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

const mockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    auth: { userId: 'user_clerk_123' },
    params: {},
    query: {},
    body: {},
    ...overrides,
  }) as unknown as Request;

const mockResponse = (): jest.Mocked<Response> => {
  const res = {} as jest.Mocked<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
describe('ReminderController', () => {
  let controller: ReminderController;
  let mockService: jest.Mocked<ReminderService>;

  beforeEach(() => {
    mockService = {
      findByUserId: jest.fn(),
      findByUserIdPaginated: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
    } as unknown as jest.Mocked<ReminderService>;

    controller = new ReminderController(mockService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getAllReminders
  // ---------------------------------------------------------------------------
  describe('getAllReminders', () => {
    it('returns all reminders without pagination by default', async () => {
      const reminders = [makeReminder()];
      mockService.findByUserId.mockResolvedValue(reminders);
      const req = mockRequest();
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { reminders },
      });
    });

    it('returns paginated reminders when page/limit query params provided', async () => {
      const reminders = [makeReminder()];
      mockService.findByUserIdPaginated.mockResolvedValue({ reminders, total: 1 });
      const req = mockRequest({ query: { page: '1', limit: '10' } });
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: STATUS.SUCCESS,
          data: { reminders },
          pagination: expect.objectContaining({ page: 1, limit: 10, total: 1 }),
        })
      );
    });

    it('returns 401 when no userId in auth', async () => {
      const req = mockRequest({ auth: undefined });
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.UNAUTHORIZED,
      });
    });

    it('returns 400 for invalid status parameter', async () => {
      const req = mockRequest({ query: { status: 'invalid' } });
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.INVALID_STATUS_PARAMETER,
      });
    });

    it('returns 400 for invalid page number', async () => {
      const req = mockRequest({ query: { page: '-1' } });
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.PAGE_MUST_BE_POSITIVE,
      });
    });

    it('returns 400 for limit > 100', async () => {
      const req = mockRequest({ query: { limit: '200' } });
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.LIMIT_MUST_BE_VALID,
      });
    });

    it('returns 500 when service throws', async () => {
      mockService.findByUserId.mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    });

    it('passes search and status filters to service', async () => {
      mockService.findByUserId.mockResolvedValue([]);
      const req = mockRequest({ query: { search: 'meeting', status: 'active' } });
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      expect(mockService.findByUserId).toHaveBeenCalledWith('user_clerk_123', 'meeting', 'active');
    });

    it('calculates pagination metadata correctly', async () => {
      mockService.findByUserIdPaginated.mockResolvedValue({ reminders: [], total: 25 });
      const req = mockRequest({ query: { page: '2', limit: '10' } });
      const res = mockResponse();

      await controller.getAllReminders(req, res);

      const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonArg.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getReminderById
  // ---------------------------------------------------------------------------
  describe('getReminderById', () => {
    it('returns reminder by ID', async () => {
      const reminder = makeReminder();
      mockService.findById.mockResolvedValue(reminder);
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await controller.getReminderById(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { reminder },
      });
    });

    it('returns 400 for non-numeric ID', async () => {
      const req = mockRequest({ params: { id: 'abc' } });
      const res = mockResponse();

      await controller.getReminderById(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.INVALID_REMINDER_ID,
      });
    });

    it('returns 400 for ID <= 0', async () => {
      const req = mockRequest({ params: { id: '0' } });
      const res = mockResponse();

      await controller.getReminderById(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
    });

    it('returns 401 when no auth', async () => {
      const req = mockRequest({ auth: undefined, params: { id: '1' } });
      const res = mockResponse();

      await controller.getReminderById(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
    });

    it('returns 404 when service throws "not found" error', async () => {
      mockService.findById.mockRejectedValue(new Error(MESSAGES.REMINDER_NOT_FOUND));
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await controller.getReminderById(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
    });
  });

  // ---------------------------------------------------------------------------
  // createReminder
  // ---------------------------------------------------------------------------
  describe('createReminder', () => {
    const futureDate = dayjs().add(1, 'day').toISOString();
    const validBody = { title: 'My Reminder', scheduled_at: futureDate };

    beforeEach(() => {
      (clerkClient.users.getUser as jest.Mock).mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('creates a reminder and returns 201', async () => {
      const reminder = makeReminder();
      mockService.create.mockResolvedValue(reminder);
      const req = mockRequest({ body: validBody });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { reminder },
      });
    });

    it('returns 401 when no auth', async () => {
      const req = mockRequest({ auth: undefined, body: validBody });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
    });

    it('returns 400 when title is missing', async () => {
      const req = mockRequest({ body: { scheduled_at: futureDate } });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.TITLE_REQUIRED,
      });
    });

    it('returns 400 when title is empty string', async () => {
      const req = mockRequest({ body: { title: '   ', scheduled_at: futureDate } });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
    });

    it('returns 400 when scheduled_at is missing', async () => {
      const req = mockRequest({ body: { title: 'Test' } });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.SCHEDULED_DATE_REQUIRED,
      });
    });

    it('returns 400 when scheduled_at is invalid date', async () => {
      const req = mockRequest({ body: { title: 'Test', scheduled_at: 'not-a-date' } });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.INVALID_SCHEDULED_DATE_FORMAT,
      });
    });

    it('returns 400 when scheduled_at is in the past', async () => {
      const pastDate = dayjs().subtract(1, 'hour').toISOString();
      const req = mockRequest({ body: { title: 'Test', scheduled_at: pastDate } });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.REMINDER_FUTURE_DATE_REQUIRED,
      });
    });

    it('returns 400 when description is not a string', async () => {
      const req = mockRequest({
        body: { title: 'Test', scheduled_at: futureDate, description: 123 },
      });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.DESCRIPTION_MUST_BE_STRING,
      });
    });

    it('returns 404 when Clerk user fetch fails', async () => {
      (clerkClient.users.getUser as jest.Mock).mockRejectedValue(new Error('Clerk error'));
      const req = mockRequest({ body: validBody });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.FAILED_FETCH_USER_INFO,
      });
    });

    it('returns 400 when Clerk user has no email', async () => {
      (clerkClient.users.getUser as jest.Mock).mockResolvedValue({
        emailAddresses: [],
        firstName: 'Test',
        lastName: 'User',
      });
      const req = mockRequest({ body: validBody });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.USER_EMAIL_NOT_FOUND,
      });
    });

    it('trims title and description before saving', async () => {
      const reminder = makeReminder();
      mockService.create.mockResolvedValue(reminder);
      const req = mockRequest({
        body: { title: '  My Reminder  ', scheduled_at: futureDate, description: '  desc  ' },
      });
      const res = mockResponse();

      await controller.createReminder(req, res);

      expect(mockService.create).toHaveBeenCalledWith(
        'user_clerk_123',
        expect.objectContaining({ title: 'My Reminder', description: 'desc' }),
        expect.any(Object)
      );
    });
  });

  // ---------------------------------------------------------------------------
  // updateReminder
  // ---------------------------------------------------------------------------
  describe('updateReminder', () => {
    it('updates reminder and returns 200', async () => {
      const updated = makeReminder({ title: 'Updated' });
      mockService.update.mockResolvedValue(updated);
      const req = mockRequest({ params: { id: '1' }, body: { title: 'Updated' } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { reminder: updated },
      });
    });

    it('returns 400 when no fields provided', async () => {
      const req = mockRequest({ params: { id: '1' }, body: {} });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.AT_LEAST_ONE_FIELD_REQUIRED,
      });
    });

    it('returns 400 for invalid reminder ID', async () => {
      const req = mockRequest({ params: { id: 'abc' }, body: { title: 'test' } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
    });

    it('returns 400 when title is empty string', async () => {
      const req = mockRequest({ params: { id: '1' }, body: { title: '' } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.TITLE_MUST_BE_NON_EMPTY,
      });
    });

    it('returns 400 when description is not a string', async () => {
      const req = mockRequest({ params: { id: '1' }, body: { description: 42 } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
    });

    it('returns 400 when scheduled_at is invalid', async () => {
      const req = mockRequest({ params: { id: '1' }, body: { scheduled_at: 'bad-date' } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
    });

    it('returns 401 when no auth', async () => {
      const req = mockRequest({ auth: undefined, params: { id: '1' }, body: { title: 'test' } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
    });

    it('returns 404 when service throws "not found" error', async () => {
      mockService.update.mockRejectedValue(new Error(MESSAGES.REMINDER_NOT_FOUND));
      const req = mockRequest({ params: { id: '999' }, body: { title: 'test' } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
    });

    it('returns 400 when service throws "future" error', async () => {
      mockService.update.mockRejectedValue(new Error(MESSAGES.REMINDER_FUTURE_DATE_REQUIRED));
      const req = mockRequest({ params: { id: '1' }, body: { scheduled_at: new Date() } });
      const res = mockResponse();

      await controller.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
    });
  });

  // ---------------------------------------------------------------------------
  // deleteReminder
  // ---------------------------------------------------------------------------
  describe('deleteReminder', () => {
    it('deletes reminder and returns 200', async () => {
      mockService.delete.mockResolvedValue(undefined);
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await controller.deleteReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { message: MESSAGES.REMINDER_DELETED_SUCCESS },
      });
    });

    it('returns 400 for invalid ID', async () => {
      const req = mockRequest({ params: { id: '0' } });
      const res = mockResponse();

      await controller.deleteReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
    });

    it('returns 401 when no auth', async () => {
      const req = mockRequest({ auth: undefined, params: { id: '1' } });
      const res = mockResponse();

      await controller.deleteReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
    });

    it('returns 404 when service throws "not found" error', async () => {
      mockService.delete.mockRejectedValue(new Error(MESSAGES.REMINDER_NOT_FOUND));
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await controller.deleteReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
    });
  });

  // ---------------------------------------------------------------------------
  // getStats
  // ---------------------------------------------------------------------------
  describe('getStats', () => {
    it('returns stats and 200', async () => {
      const stats = { total: 10, active: 6, completed: 4 };
      mockService.getStats.mockResolvedValue(stats);
      const req = mockRequest();
      const res = mockResponse();

      await controller.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { stats },
      });
    });

    it('returns 401 when no auth', async () => {
      const req = mockRequest({ auth: undefined });
      const res = mockResponse();

      await controller.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
    });

    it('returns 500 when service throws', async () => {
      mockService.getStats.mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();

      await controller.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    });
  });
});
