import { Request, Response } from 'express';
import { UserController } from '@/modules/users/user.controller';
import { UserService } from '@/modules/users/user.service';
import { User } from '@/modules/users/entities/User.entity';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';

jest.mock('@/configs/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
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
    slack_notifications_enabled: false,
    console_notifications_enabled: true,
    reminders: [],
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }) as User;

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
// Tests
// ---------------------------------------------------------------------------
describe('UserController', () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockService = {
      findOrCreateByClerkId: jest.fn(),
      findByClerkId: jest.fn(),
      update: jest.fn(),
      updateNotificationSettings: jest.fn(),
      getNotificationSettings: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(mockService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getUserProfile
  // ---------------------------------------------------------------------------
  describe('getUserProfile', () => {
    it('returns user profile with 200', async () => {
      const user = makeUser();
      mockService.findOrCreateByClerkId.mockResolvedValue(user);
      const req = mockRequest();
      const res = mockResponse();

      await controller.getUserProfile(req, res);

      expect(mockService.findOrCreateByClerkId).toHaveBeenCalledWith('user_clerk_123');
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { user },
      });
    });

    it('returns 401 when no userId in auth', async () => {
      const req = mockRequest({ auth: undefined });
      const res = mockResponse();

      await controller.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.UNAUTHORIZED_NO_USER_ID,
      });
      expect(mockService.findOrCreateByClerkId).not.toHaveBeenCalled();
    });

    it('returns 500 when service throws', async () => {
      mockService.findOrCreateByClerkId.mockRejectedValue(new Error('Service error'));
      const req = mockRequest();
      const res = mockResponse();

      await controller.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: 'Service error',
      });
    });

    it('uses FAILED_FETCH_USER_PROFILE message when error is not an Error instance', async () => {
      mockService.findOrCreateByClerkId.mockRejectedValue('unknown error');
      const req = mockRequest();
      const res = mockResponse();

      await controller.getUserProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.FAILED_FETCH_USER_PROFILE,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getNotificationSettings
  // ---------------------------------------------------------------------------
  describe('getNotificationSettings', () => {
    it('returns notification settings with 200', async () => {
      const settings = { email_notifications_enabled: true, slack_notifications_enabled: false };
      mockService.getNotificationSettings.mockResolvedValue(settings);
      const req = mockRequest();
      const res = mockResponse();

      await controller.getNotificationSettings(req, res);

      expect(mockService.getNotificationSettings).toHaveBeenCalledWith('user_clerk_123');
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { settings },
      });
    });

    it('returns 401 when no auth', async () => {
      const req = mockRequest({ auth: undefined });
      const res = mockResponse();

      await controller.getNotificationSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.UNAUTHORIZED_NO_USER_ID,
      });
    });

    it('returns 500 when service throws', async () => {
      mockService.getNotificationSettings.mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();

      await controller.getNotificationSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: 'DB error',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // updateNotificationSettings
  // ---------------------------------------------------------------------------
  describe('updateNotificationSettings', () => {
    it('updates email setting and returns 200', async () => {
      const updatedUser = makeUser({ email_notifications_enabled: false });
      mockService.updateNotificationSettings.mockResolvedValue(updatedUser);
      const req = mockRequest({ body: { email_notifications_enabled: false } });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(mockService.updateNotificationSettings).toHaveBeenCalledWith('user_clerk_123', {
        email_notifications_enabled: false,
      });
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.SUCCESS,
        data: { user: updatedUser },
        message: 'Notification settings updated successfully',
      });
    });

    it('updates slack setting and returns 200', async () => {
      const updatedUser = makeUser({ slack_notifications_enabled: true });
      mockService.updateNotificationSettings.mockResolvedValue(updatedUser);
      const req = mockRequest({ body: { slack_notifications_enabled: true } });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(mockService.updateNotificationSettings).toHaveBeenCalledWith('user_clerk_123', {
        slack_notifications_enabled: true,
      });
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
    });

    it('updates both settings at once', async () => {
      const updatedUser = makeUser({
        email_notifications_enabled: false,
        slack_notifications_enabled: true,
      });
      mockService.updateNotificationSettings.mockResolvedValue(updatedUser);
      const req = mockRequest({
        body: { email_notifications_enabled: false, slack_notifications_enabled: true },
      });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(mockService.updateNotificationSettings).toHaveBeenCalledWith('user_clerk_123', {
        email_notifications_enabled: false,
        slack_notifications_enabled: true,
      });
    });

    it('returns 401 when no auth', async () => {
      const req = mockRequest({ auth: undefined, body: { email_notifications_enabled: true } });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.UNAUTHORIZED_NO_USER_ID,
      });
    });

    it('returns 400 when no settings fields provided', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: 'At least one notification setting must be provided',
      });
    });

    it('returns 500 when email_notifications_enabled is not boolean', async () => {
      const req = mockRequest({ body: { email_notifications_enabled: 'yes' } });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: 'email_notifications_enabled must be a boolean value',
      });
    });

    it('returns 500 when slack_notifications_enabled is not boolean', async () => {
      const req = mockRequest({ body: { slack_notifications_enabled: 1 } });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    });

    it('returns 500 when service throws', async () => {
      mockService.updateNotificationSettings.mockRejectedValue(new Error(MESSAGES.USER_NOT_FOUND));
      const req = mockRequest({ body: { email_notifications_enabled: true } });
      const res = mockResponse();

      await controller.updateNotificationSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS.ERROR,
        message: MESSAGES.USER_NOT_FOUND,
      });
    });
  });
});
