import { Request, Response } from 'express';
import { UserController } from '../controllers';
import { UserService } from '../services';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

// Mock the UserService
jest.mock('../services');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };

    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: undefined,
    };

    // Create mock service instance
    mockUserService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      deleteAllUsers: jest.fn(),
    } as any;

    // Create controller with mock service
    userController = new UserController(mockUserService);

    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@gmail.com' },
        { id: 2, username: 'user2', email: 'user2@gmail.com' },
      ];

      (mockUserService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 when service throws an error', async () => {
      (mockUserService.getAllUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.RETRIEVE_FAILED });
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, username: 'user1', email: 'user1@gmail.com' };
      mockRequest.params = { id: '1' };

      (mockUserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '999' };

      (mockUserService.getUserById as jest.Mock).mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.NOT_FOUND });
    });

    it('should return 400 when user ID is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.INVALID_ID });
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { id: '1' };

      (mockUserService.getUserById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.RETRIEVE_ONE_FAILED });
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const mockUser = { id: 1, username: 'updateduser', email: 'updated@gmail.com' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { username: 'updateduser', email: 'updated@gmail.com' };

      (mockUserService.updateUser as jest.Mock).mockResolvedValue(mockUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, {
        username: 'updateduser',
        email: 'updated@gmail.com',
      });
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 when user ID is invalid', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { username: 'updateduser' };

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.INVALID_ID });
      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { username: 'updateduser' };

      (mockUserService.updateUser as jest.Mock).mockResolvedValue(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.NOT_FOUND });
    });

    it('should return 400 when service throws an Error instance', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 'invalid-email' };

      const error = new Error('Invalid email format');
      (mockUserService.updateUser as jest.Mock).mockRejectedValue(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid email format' });
    });

    it('should return 500 when service throws a non-Error', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { username: 'updateduser' };

      (mockUserService.updateUser as jest.Mock).mockRejectedValue('Unknown error');

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.UPDATE_FAILED });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      mockRequest.params = { id: '1' };

      (mockUserService.deleteUser as jest.Mock).mockResolvedValue(true);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NO_CONTENT);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 400 when user ID is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.INVALID_ID });
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '1' };

      (mockUserService.deleteUser as jest.Mock).mockResolvedValue(false);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.NOT_FOUND });
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { id: '1' };

      (mockUserService.deleteUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.DELETE_FAILED });
    });
  });

  describe('deleteAllUsers', () => {
    it('should delete all users and return count', async () => {
      (mockUserService.deleteAllUsers as jest.Mock).mockResolvedValue(5);

      await userController.deleteAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteAllUsers).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: MESSAGES.USER.DELETED_SUCCESS(5),
        count: 5,
      });
    });

    it('should handle when no users are deleted (count = 0)', async () => {
      (mockUserService.deleteAllUsers as jest.Mock).mockResolvedValue(0);

      await userController.deleteAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: MESSAGES.USER.DELETED_SUCCESS(0),
        count: 0,
      });
    });

    it('should return 500 when service throws an error', async () => {
      (mockUserService.deleteAllUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.deleteAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.DELETE_ALL_FAILED });
    });
  });
});
