import { AuthService } from '../services';
import User from '@/modules/users/model';
import { sequelize } from '@/configs/db';
import '@/configs/associations';
import { MESSAGES } from '@/constants/messages';
import jwt from 'jwt-simple';
import { appConfig } from '@/configs/appConfig';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    authService = new AuthService();
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('signUp', () => {
    it('should create a new user and return token with user data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.signUp(userData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe(userData.username);
      expect(result.user.email).toBe(userData.email);
      expect(result.user).toHaveProperty('id');
      expect(result.user).not.toHaveProperty('password');

      // Verify token is valid
      const decoded = authService.decodeToken(result.token);
      expect(decoded).toHaveProperty('id', result.user.id);
      expect(decoded).toHaveProperty('iat');
    });

    it('should throw error for invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(authService.signUp(userData)).rejects.toThrow(MESSAGES.AUTH.INVALID_EMAIL);
    });

    it('should throw error for weak password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345', // Less than 6 characters
      };

      await expect(authService.signUp(userData)).rejects.toThrow(MESSAGES.AUTH.WEAK_PASSWORD);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Create user first time
      await authService.signUp(userData);

      // Try to create again
      await expect(authService.signUp(userData)).rejects.toThrow(MESSAGES.AUTH.USER_ALREADY_EXISTS);
    });

    it('should hash the password before storing', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await authService.signUp(userData);

      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).not.toBeNull();
      expect(user!.password).not.toBe(userData.password); // Password should be hashed
      expect(user!.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('signIn', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should authenticate user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.signIn(credentials);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(credentials.email);
      expect(result.user.username).toBe('testuser');
      expect(result.user).toHaveProperty('id');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error for non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.signIn(credentials)).rejects.toThrow(
        MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    });

    it('should throw error for incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.signIn(credentials)).rejects.toThrow(
        MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    });

    it('should return a valid JWT token', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.signIn(credentials);

      expect(result.token).toBeTruthy();

      // Verify token can be decoded
      const decoded = authService.decodeToken(result.token);
      expect(decoded).toHaveProperty('id', result.user.id);
      expect(decoded).toHaveProperty('iat');
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token for a user ID', () => {
      const userId = 123;
      const token = authService.generateToken(userId);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.decode(token, appConfig.jwtSecret);
      expect(decoded).toHaveProperty('id', userId);
      expect(decoded).toHaveProperty('iat');
    });

    it('should generate different tokens for different users', () => {
      const token1 = authService.generateToken(1);
      const token2 = authService.generateToken(2);

      expect(token1).not.toBe(token2);
    });

    it('should include timestamp in token', () => {
      const userId = 1;
      const beforeTimestamp = Math.floor(Date.now() / 1000);
      const token = authService.generateToken(userId);
      const afterTimestamp = Math.floor(Date.now() / 1000);

      const decoded = authService.decodeToken(token);
      expect(decoded.iat).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(decoded.iat).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const userId = 456;
      const token = authService.generateToken(userId);

      const decoded = authService.decodeToken(token);

      expect(decoded).toHaveProperty('id', userId);
      expect(decoded).toHaveProperty('iat');
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => authService.decodeToken(invalidToken)).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = authService.generateToken(1);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => authService.decodeToken(tamperedToken)).toThrow();
    });
  });
});
