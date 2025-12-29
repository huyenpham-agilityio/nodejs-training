import request from 'supertest';
import app from '@/app';
import { sequelize } from '@/configs/db';
import '@/configs/associations'; // Import associations
import User from '@/modules/users/model';
import Post from '@/modules/posts/model';
import Comment from '@/modules/comments/model';
import { appConfig } from '@/configs/appConfig';
import jwt from 'jwt-simple';

describe('Comments Routes', () => {
  let authToken: string;
  let testUser: User;
  let testPost: Post;

  beforeAll(async () => {
    // Ensure associations are loaded and database is synced
    await sequelize.sync({ force: true });
    // Give a moment for associations to be fully established
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await Comment.destroy({ where: {}, truncate: true, cascade: true });
    await Post.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@gmail.com',
      password: 'password123',
    });

    // Create test post
    testPost = await Post.create({
      title: 'Test Post',
      content: 'This is a test post',
      userId: testUser.id,
    });

    // Generate auth token
    authToken = jwt.encode({ id: testUser.id }, appConfig.jwtSecret);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /comments', () => {
    it('should filter comments by postId query parameter', async () => {
      const post2 = await Post.create({
        title: 'Post 2',
        content: 'Second post',
        userId: testUser.id,
      });

      await Comment.create({
        content: 'Comment on post 1',
        postId: testPost.id,
        userId: testUser.id,
      });

      await Comment.create({
        content: 'Comment on post 2',
        postId: post2.id,
        userId: testUser.id,
      });

      const response = await request(app).get(`/comments?postId=${testPost.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].content).toBe('Comment on post 1');
    });

    it('should return 400 for invalid postId query parameter', async () => {
      const response = await request(app).get('/comments?postId=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /comments/:id', () => {
    it('should return a single comment by ID', async () => {
      const comment = await Comment.create({
        content: 'Test comment',
        postId: testPost.id,
        userId: testUser.id,
      });

      const response = await request(app).get(`/comments/${comment.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(comment.id);
      expect(response.body.content).toBe('Test comment');
      expect(response.body.author).toBeDefined();
    });

    it('should return 404 when comment not found', async () => {
      const response = await request(app).get('/comments/9999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /comments', () => {
    it('should create a new comment when authenticated', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'New comment',
          postId: testPost.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('New comment');
      expect(response.body.postId).toBe(testPost.id);
      expect(response.body.userId).toBe(testUser.id);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).post('/comments').send({
        content: 'New comment',
        postId: testPost.id,
      });

      expect(response.status).toBe(401);
    });

    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          postId: testPost.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when postId is missing', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'New comment',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when postId is invalid', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'New comment',
          postId: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when post does not exist', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'New comment',
          postId: 9999,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update a comment when authenticated as owner', async () => {
      const comment = await Comment.create({
        content: 'Original comment',
        postId: testPost.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .put(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated comment',
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated comment');
    });

    it('should return 401 when not authenticated', async () => {
      const comment = await Comment.create({
        content: 'Original comment',
        postId: testPost.id,
        userId: testUser.id,
      });

      const response = await request(app).put(`/comments/${comment.id}`).send({
        content: 'Updated comment',
      });

      expect(response.status).toBe(401);
    });

    it('should return 404 when comment not found or not owned by user', async () => {
      const response = await request(app)
        .put('/comments/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated comment',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid comment ID', async () => {
      const response = await request(app)
        .put('/comments/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated comment',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when content is missing', async () => {
      const comment = await Comment.create({
        content: 'Original comment',
        postId: testPost.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .put(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should not allow updating another users comment', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@gmail.com',
        password: 'password123',
      });

      const comment = await Comment.create({
        content: 'Other users comment',
        postId: testPost.id,
        userId: otherUser.id,
      });

      const response = await request(app)
        .put(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Trying to update',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment when authenticated as owner', async () => {
      const comment = await Comment.create({
        content: 'Test comment',
        postId: testPost.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .delete(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedComment = await Comment.findByPk(comment.id);
      expect(deletedComment).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const comment = await Comment.create({
        content: 'Test comment',
        postId: testPost.id,
        userId: testUser.id,
      });

      const response = await request(app).delete(`/comments/${comment.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 when comment not found or not owned by user', async () => {
      const response = await request(app)
        .delete('/comments/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid comment ID', async () => {
      const response = await request(app)
        .delete('/comments/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should not allow deleting another users comment', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@gmail.com',
        password: 'password123',
      });

      const comment = await Comment.create({
        content: 'Other users comment',
        postId: testPost.id,
        userId: otherUser.id,
      });

      const response = await request(app)
        .delete(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /comments', () => {
    it('should delete all comments by user for a specific post', async () => {
      await Comment.create({
        content: 'Comment 1',
        postId: testPost.id,
        userId: testUser.id,
      });

      await Comment.create({
        content: 'Comment 2',
        postId: testPost.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .delete('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ postId: testPost.id });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.message).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete('/comments').send({ postId: testPost.id });

      expect(response.status).toBe(401);
    });

    it('should return 400 when postId is missing', async () => {
      const response = await request(app)
        .delete('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid postId', async () => {
      const response = await request(app)
        .delete('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ postId: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should only delete comments by the authenticated user', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@gmail.com',
        password: 'password123',
      });

      await Comment.create({
        content: 'My comment',
        postId: testPost.id,
        userId: testUser.id,
      });

      await Comment.create({
        content: 'Other users comment',
        postId: testPost.id,
        userId: otherUser.id,
      });

      const response = await request(app)
        .delete('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ postId: testPost.id });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1); // Only deletes the authenticated user's comments

      const remainingComments = await Comment.findAll({ where: { postId: testPost.id } });
      expect(remainingComments).toHaveLength(1);
      expect(remainingComments[0].userId).toBe(otherUser.id);
    });

    it('should return count 0 when no comments to delete', async () => {
      const response = await request(app)
        .delete('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ postId: testPost.id });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });
});
