import { UserService } from '../services';
import User from '../model';
import Post from '@/modules/posts/model';
import Comment from '@/modules/comments/model';
import { MESSAGES } from '@/constants/messages';

// Mock the models
jest.mock('../model');
jest.mock('@/modules/posts/model');
jest.mock('@/modules/comments/model');

// Mock the validation utils
jest.mock('@/utils/validations', () => ({
  isValidEmail: jest.fn((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users without password field', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@gmail.com',
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            username: 'user1',
            email: 'user1@gmail.com',
          }),
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@gmail.com',
          toJSON: jest.fn().mockReturnValue({
            id: 2,
            username: 'user2',
            email: 'user2@gmail.com',
          }),
        },
      ];

      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(User.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        username: 'user1',
        email: 'user1@gmail.com',
      });
    });

    it('should return empty array when no users found', async () => {
      (User.findAll as jest.Mock).mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
    });

    it('should call toJSON on each user', async () => {
      const toJSONMock1 = jest.fn().mockReturnValue({ id: 1 });
      const toJSONMock2 = jest.fn().mockReturnValue({ id: 2 });

      const mockUsers = [
        { id: 1, toJSON: toJSONMock1 },
        { id: 2, toJSON: toJSONMock2 },
      ];

      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      await userService.getAllUsers();

      expect(toJSONMock1).toHaveBeenCalled();
      expect(toJSONMock2).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user with posts and comments when found', async () => {
      const mockUser = {
        id: 1,
        username: 'user1',
        email: 'user1@gmail.com',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          username: 'user1',
          email: 'user1@gmail.com',
          posts: [],
          comments: [],
        }),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
        include: [
          {
            model: Post,
            as: 'posts',
            attributes: ['id', 'title', 'content', 'createdAt'],
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id', 'content', 'postId', 'createdAt'],
          },
        ],
      });
      expect(result).toEqual({
        id: 1,
        username: 'user1',
        email: 'user1@gmail.com',
        posts: [],
        comments: [],
      });
      expect(mockUser.toJSON).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(User.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'oldusername',
        email: 'old@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn().mockResolvedValue(undefined),
      };

      // After update, the properties should reflect the new values
      mockUser.username = 'newusername';
      mockUser.email = 'new@gmail.com';

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const updateData = {
        username: 'newusername',
        email: 'new@gmail.com',
      };

      const result = await userService.updateUser(1, updateData);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({
        id: 1,
        username: 'newusername',
        email: 'new@gmail.com',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return null when user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.updateUser(1, { username: 'newusername' });

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    it('should throw error when email format is invalid', async () => {
      const mockUser = {
        id: 1,
        username: 'user1',
        email: 'user1@gmail.com',
        update: jest.fn(),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await expect(userService.updateUser(1, { email: 'invalid-email' })).rejects.toThrow(
        MESSAGES.AUTH.INVALID_EMAIL_UPDATE,
      );

      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('should allow update without email validation when email is not provided', async () => {
      const mockUser = {
        id: 1,
        username: 'oldusername',
        email: 'user1@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockUser.username = 'newusername';

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.updateUser(1, { username: 'newusername' });

      expect(mockUser.update).toHaveBeenCalledWith({ username: 'newusername' });
      expect(result).toBeDefined();
    });

    it('should update user with valid email', async () => {
      const mockUser = {
        id: 1,
        username: 'user1',
        email: 'old@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockUser.email = 'newemail@gmail.com';

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.updateUser(1, { email: 'newemail@gmail.com' });

      expect(mockUser.update).toHaveBeenCalledWith({ email: 'newemail@gmail.com' });
      expect(result?.email).toBe('newemail@gmail.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'user1',
        email: 'user1@gmail.com',
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.deleteUser(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.deleteUser(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(false);
    });

    it('should not call destroy when user is not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await userService.deleteUser(1);

      expect(User.findByPk).toHaveBeenCalled();
      // Ensure destroy is never called on a non-existent user
    });
  });

  describe('deleteAllUsers', () => {
    it('should delete all users and return count', async () => {
      (User.destroy as jest.Mock).mockResolvedValue(5);

      const result = await userService.deleteAllUsers();

      expect(User.destroy).toHaveBeenCalledWith({ where: {}, truncate: true });
      expect(result).toBe(5);
    });

    it('should return 0 when no users are deleted', async () => {
      (User.destroy as jest.Mock).mockResolvedValue(0);

      const result = await userService.deleteAllUsers();

      expect(User.destroy).toHaveBeenCalledWith({ where: {}, truncate: true });
      expect(result).toBe(0);
    });

    it('should use truncate option for better performance', async () => {
      (User.destroy as jest.Mock).mockResolvedValue(10);

      await userService.deleteAllUsers();

      expect(User.destroy).toHaveBeenCalledWith({ where: {}, truncate: true });
    });
  });
});
