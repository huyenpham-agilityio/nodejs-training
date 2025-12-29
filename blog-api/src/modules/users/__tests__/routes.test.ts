import request from 'supertest';
import jwt from 'jwt-simple';
import app from '@/app';
import { sequelize } from '@/configs/db';
import { appConfig } from '@/configs/appConfig';
import User from '@/modules/users/model';

// Use the same JWT secret as the app configuration
const jwtSecret = appConfig.jwtSecret;

describe('Users Routes', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Clean up database
    await User.destroy({ where: {} });

    // Create a test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@gmail.com',
      password: '123456',
    });

    userId = user.id;
    token = jwt.encode({ id: user.id }, jwtSecret);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /users', () => {
    it('should return all users when authenticated', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('testuser');
      expect(res.body[0].email).toBe('test@gmail.com');
      expect(res.body[0].password).toBeUndefined();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/users').expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user by ID when authenticated', async () => {
      const res = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(userId);
      expect(res.body.username).toBe('testuser');
      expect(res.body.email).toBe('test@gmail.com');
      expect(res.body.password).toBeUndefined();
    });

    it('should return 404 when user not found', async () => {
      const res = await request(app)
        .get('/users/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app)
        .get('/users/invalid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get(`/users/${userId}`).expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user when authenticated', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'updateduser',
          email: 'updated@gmail.com',
        })
        .expect(200);

      expect(res.body.username).toBe('updateduser');
      expect(res.body.email).toBe('updated@gmail.com');
      expect(res.body.id).toBe(userId);
    });

    it('should update only username', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newusername',
        })
        .expect(200);

      expect(res.body.username).toBe('newusername');
      expect(res.body.email).toBe('test@gmail.com');
    });

    it('should update only email', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newemail@gmail.com',
        })
        .expect(200);

      expect(res.body.username).toBe('testuser');
      expect(res.body.email).toBe('newemail@gmail.com');
    });

    it('should return 400 when email format is invalid', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .send({
          username: 'updateduser',
        })
        .expect(401);

      expect(res.body.error).toBeDefined();
    });

    it('should return 404 when user not found', async () => {
      const res = await request(app)
        .put('/users/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'updateduser',
        })
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app)
        .put('/users/invalid')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'updateduser',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user when authenticated', async () => {
      await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify user is deleted
      const deletedUser = await User.findByPk(userId);
      expect(deletedUser).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete(`/users/${userId}`).expect(401);

      expect(res.body.error).toBeDefined();
    });

    it('should return 404 when user not found', async () => {
      const res = await request(app)
        .delete('/users/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app)
        .delete('/users/invalid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /users', () => {
    it('should delete all users when authenticated', async () => {
      // Create multiple users
      await User.create({
        username: 'user2',
        email: 'user2@gmail.com',
        password: '123456',
      });

      await User.create({
        username: 'user3',
        email: 'user3@gmail.com',
        password: '123456',
      });

      const res = await request(app)
        .delete('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify response contains count
      expect(res.body.count).toBeGreaterThanOrEqual(0);

      // Verify all users are deleted
      const remainingUsers = await User.findAll();
      expect(remainingUsers.length).toBe(0);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete('/users').expect(401);

      expect(res.body.error).toBeDefined();
    });
  });
});
