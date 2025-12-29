import request from 'supertest';
import app from '@/app';
import { sequelize } from '@/configs/db';
import '@/configs/associations';
import User from '@/modules/users/model';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return token', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/auth/signup').send(userData);

      expect(response.status).toBe(HTTP_STATUS_CODES.CREATED);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).not.toBeNull();
      expect(user!.username).toBe(userData.username);
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS);
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app).post('/auth/signup').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS);
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app).post('/auth/signup').send({
        username: 'testuser',
        email: 'test@example.com',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/auth/signup').send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.INVALID_EMAIL);
    });

    it('should return 400 for weak password (less than 6 characters)', async () => {
      const response = await request(app).post('/auth/signup').send({
        username: 'testuser',
        email: 'test@example.com',
        password: '12345',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.WEAK_PASSWORD);
    });

    it('should return 400 when user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Create user first time
      await request(app).post('/auth/signup').send(userData);

      // Try to create again
      const response = await request(app).post('/auth/signup').send(userData);

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.USER_ALREADY_EXISTS);
    });

    it('should hash password before storing', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app).post('/auth/signup').send(userData);

      const user = await User.findOne({ where: { email: userData.email } });
      expect(user!.password).not.toBe(userData.password);
      expect(user!.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/auth/signup').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should authenticate user with valid credentials', async () => {
      const response = await request(app).post('/auth/signin').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.OK);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app).post('/auth/signin').send({
        password: 'password123',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.SIGNIN_REQUIRED_FIELDS);
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app).post('/auth/signin').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(response.body.error).toBe(MESSAGES.AUTH.SIGNIN_REQUIRED_FIELDS);
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app).post('/auth/signin').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(response.body.error).toBe(MESSAGES.AUTH.INVALID_CREDENTIALS);
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app).post('/auth/signin').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(response.body.error).toBe(MESSAGES.AUTH.INVALID_CREDENTIALS);
    });

    it('should return a valid token that can be used for authentication', async () => {
      const signInResponse = await request(app).post('/auth/signin').send({
        email: 'test@example.com',
        password: 'password123',
      });

      const token = signInResponse.body.token;

      // Use the token to access a protected route
      const protectedResponse = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(protectedResponse.status).toBe(HTTP_STATUS_CODES.OK);
    });

    it('should allow multiple sign-ins for the same user', async () => {
      const response1 = await request(app).post('/auth/signin').send({
        email: 'test@example.com',
        password: 'password123',
      });

      // Wait a moment to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response2 = await request(app).post('/auth/signin').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response1.status).toBe(HTTP_STATUS_CODES.OK);
      expect(response2.status).toBe(HTTP_STATUS_CODES.OK);
      expect(response1.body.token).toBeTruthy();
      expect(response2.body.token).toBeTruthy();
      expect(response1.body.user.id).toBe(response2.body.user.id);
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full signup and signin flow', async () => {
      // Step 1: Sign up
      const signUpResponse = await request(app).post('/auth/signup').send({
        username: 'flowuser',
        email: 'flow@example.com',
        password: 'flowpass123',
      });

      expect(signUpResponse.status).toBe(HTTP_STATUS_CODES.CREATED);
      const signUpToken = signUpResponse.body.token;
      const userId = signUpResponse.body.user.id;

      // Step 2: Use signup token to access protected route
      const protectedResponse1 = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${signUpToken}`);

      expect(protectedResponse1.status).toBe(HTTP_STATUS_CODES.OK);

      // Step 3: Sign in
      const signInResponse = await request(app).post('/auth/signin').send({
        email: 'flow@example.com',
        password: 'flowpass123',
      });

      expect(signInResponse.status).toBe(HTTP_STATUS_CODES.OK);
      const signInToken = signInResponse.body.token;

      // Step 4: Use signin token to access protected route
      const protectedResponse2 = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${signInToken}`);

      expect(protectedResponse2.status).toBe(HTTP_STATUS_CODES.OK);
    });
  });
});
