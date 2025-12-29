import { Request, Response } from 'express';
import { AuthController } from '../controllers';
import { AuthService } from '../services';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

// Mock the AuthService
jest.mock('../services');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    // Create a mock AuthService instance
    mockAuthService = {
      signUp: jest.fn(),
      signIn: jest.fn(),
      generateToken: jest.fn(),
      decodeToken: jest.fn(),
    } as any;

    // Create controller with mocked service
    authController = new AuthController(mockAuthService);

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user and return token', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResult = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      mockRequest.body = userData;
      mockAuthService.signUp.mockResolvedValue(mockResult);

      await authController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(userData);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when username is missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await authController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signUp).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        error: MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS,
      });
    });

    it('should return 400 when email is missing', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123',
      };

      await authController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signUp).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        error: MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS,
      });
    });

    it('should return 400 when password is missing', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
      };

      await authController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signUp).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        error: MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS,
      });
    });

    it('should return 400 when all fields are missing', async () => {
      mockRequest.body = {};

      await authController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signUp).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        error: MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS,
      });
    });

    it('should return 400 when service throws an Error', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      mockAuthService.signUp.mockRejectedValue(new Error(MESSAGES.AUTH.INVALID_EMAIL));

      await authController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.AUTH.INVALID_EMAIL });
    });

    it('should return 500 when service throws a non-Error', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.signUp.mockRejectedValue('Unknown error');

      await authController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    });
  });

  describe('signIn', () => {
    it('should authenticate user and return token', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResult = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      mockRequest.body = credentials;
      mockAuthService.signIn.mockResolvedValue(mockResult);

      await authController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(credentials);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when email is missing', async () => {
      mockRequest.body = {
        password: 'password123',
      };

      await authController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signIn).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        error: MESSAGES.AUTH.SIGNIN_REQUIRED_FIELDS,
      });
    });

    it('should return 400 when password is missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      await authController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signIn).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        error: MESSAGES.AUTH.SIGNIN_REQUIRED_FIELDS,
      });
    });

    it('should return 400 when both fields are missing', async () => {
      mockRequest.body = {};

      await authController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signIn).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        error: MESSAGES.AUTH.SIGNIN_REQUIRED_FIELDS,
      });
    });

    it('should return 401 when service throws an Error (invalid credentials)', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.signIn.mockRejectedValue(new Error(MESSAGES.AUTH.INVALID_CREDENTIALS));

      await authController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.AUTH.INVALID_CREDENTIALS });
    });

    it('should return 500 when service throws a non-Error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.signIn.mockRejectedValue('Database connection error');

      await authController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    });
  });
});
