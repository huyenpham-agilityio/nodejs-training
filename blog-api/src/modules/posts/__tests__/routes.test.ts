import request from 'supertest';
import jwt from 'jwt-simple';

import app from '@/app';
import { sequelize } from '@/configs/db';
import { appConfig } from '@/configs/appConfig';
import User from '@/modules/users/model';
import Post from '@/modules/posts/model';

// Use the same JWT secret as the app configuration
const jwtSecret = appConfig.jwtSecret;

describe('Posts Routes', () => {
  let token: string;
  let userId: number;
  let postId: number;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Clean up database
    await Post.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create a test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@gmail.com',
      password: '123456',
    });

    userId = user.id;
    token = jwt.encode({ id: user.id }, jwtSecret);

    // Create a test post
    const post = await Post.create({
      title: 'Test Post',
      content: 'This is a test post content',
      userId: user.id,
    });

    postId = post.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      const res = await request(app).get('/posts').expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Test Post');
      expect(res.body[0].content).toBe('This is a test post content');
    });

    it('should filter posts by userId', async () => {
      // Create another user and post
      const user2 = await User.create({
        username: 'testuser2',
        email: 'test2@gmail.com',
        password: '123456',
      });

      await Post.create({
        title: 'Another Post',
        content: 'Another post content',
        userId: user2.id,
      });

      const res = await request(app).get(`/posts?userId=${userId}`).expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].userId).toBe(userId);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a single post by ID', async () => {
      const res = await request(app).get(`/posts/${postId}`).expect(200);

      expect(res.body.id).toBe(postId);
      expect(res.body.title).toBe('Test Post');
      expect(res.body.content).toBe('This is a test post content');
      expect(res.body.userId).toBe(userId);
    });

    it('should return 404 if post not found', async () => {
      const res = await request(app).get('/posts/9999').expect(404);

      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for invalid post ID', async () => {
      const res = await request(app).get('/posts/invalid').expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /posts', () => {
    it('should create a new post when authenticated', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Post',
          content: 'This is a new post content',
        })
        .expect(201);

      expect(res.body.title).toBe('New Post');
      expect(res.body.content).toBe('This is a new post content');
      expect(res.body.userId).toBe(userId);
      expect(res.body.id).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/posts')
        .send({
          title: 'New Post',
          content: 'This is a new post content',
        })
        .expect(401);

      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is a new post content',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when content is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Post',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update a post when authenticated as owner', async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Post',
          content: 'Updated content',
        })
        .expect(200);

      expect(res.body.title).toBe('Updated Post');
      expect(res.body.content).toBe('Updated content');
      expect(res.body.id).toBe(postId);
    });

    it('should update only title', async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title Only',
        })
        .expect(200);

      expect(res.body.title).toBe('Updated Title Only');
      expect(res.body.content).toBe('This is a test post content');
    });

    it('should update only content', async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Updated Content Only',
        })
        .expect(200);

      expect(res.body.title).toBe('Test Post');
      expect(res.body.content).toBe('Updated Content Only');
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .send({
          title: 'Updated Post',
        })
        .expect(401);

      expect(res.body.error).toBeDefined();
    });

    it("should return 404 when trying to update another user's post", async () => {
      // Create another user
      const user2 = await User.create({
        username: 'testuser2',
        email: 'test2@gmail.com',
        password: '123456',
      });

      const token2 = jwt.encode({ id: user2.id }, jwtSecret);

      const res = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          title: 'Updated Post',
        })
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    it('should return 404 when post not found', async () => {
      const res = await request(app)
        .put('/posts/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Post',
        })
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post when authenticated as owner', async () => {
      await request(app)
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify post is deleted
      const deletedPost = await Post.findByPk(postId);
      expect(deletedPost).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete(`/posts/${postId}`).expect(401);

      expect(res.body.error).toBeDefined();
    });

    it("should return 404 when trying to delete another user's post", async () => {
      // Create another user
      const user2 = await User.create({
        username: 'testuser2',
        email: 'test2@gmail.com',
        password: '123456',
      });

      const token2 = jwt.encode({ id: user2.id }, jwtSecret);

      const res = await request(app)
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    it('should return 404 when post not found', async () => {
      const res = await request(app)
        .delete('/posts/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /posts', () => {
    it('should delete all posts by authenticated user', async () => {
      // Create multiple posts
      await Post.create({
        title: 'Post 2',
        content: 'Content 2',
        userId: userId,
      });

      await Post.create({
        title: 'Post 3',
        content: 'Content 3',
        userId: userId,
      });

      const res = await request(app)
        .delete('/posts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify response contains count
      expect(res.body.count).toBe(3);

      // Verify all posts are deleted
      const remainingPosts = await Post.findAll({ where: { userId } });
      expect(remainingPosts.length).toBe(0);
    });

    it('should not delete posts from other users', async () => {
      // Create another user and their post
      const user2 = await User.create({
        username: 'testuser2',
        email: 'test2@gmail.com',
        password: '123456',
      });

      const post2 = await Post.create({
        title: 'User 2 Post',
        content: 'User 2 Content',
        userId: user2.id,
      });

      const res = await request(app)
        .delete('/posts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify only user 1's post was deleted
      expect(res.body.count).toBe(1);

      // Verify user 2's post still exists
      const user2Post = await Post.findByPk(post2.id);
      expect(user2Post).not.toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete('/posts').expect(401);

      expect(res.body.error).toBeDefined();
    });
  });
});
