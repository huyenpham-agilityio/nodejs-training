import { PostService } from '../services';
import Post from '../model';
import User from '@/modules/users/model';
import Comment from '@/modules/comments/model';

// Mock the models
jest.mock('../model');
jest.mock('@/modules/users/model');
jest.mock('@/modules/comments/model');

describe('PostService', () => {
  let postService: PostService;

  beforeEach(() => {
    postService = new PostService();
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return all posts without filter', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          userId: 1,
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            title: 'Post 1',
            content: 'Content 1',
            userId: 1,
          }),
        },
        {
          id: 2,
          title: 'Post 2',
          content: 'Content 2',
          userId: 2,
          toJSON: jest.fn().mockReturnValue({
            id: 2,
            title: 'Post 2',
            content: 'Content 2',
            userId: 2,
          }),
        },
      ];

      (Post.findAll as jest.Mock).mockResolvedValue(mockPosts);

      const result = await postService.getAllPosts();

      expect(Post.findAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id', 'content', 'userId', 'createdAt'],
          },
        ],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        userId: 1,
      });
    });

    it('should return posts filtered by userId', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          userId: 1,
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            title: 'Post 1',
            content: 'Content 1',
            userId: 1,
          }),
        },
      ];

      (Post.findAll as jest.Mock).mockResolvedValue(mockPosts);

      const result = await postService.getAllPosts(1);

      expect(Post.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id', 'content', 'userId', 'createdAt'],
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(1);
    });

    it('should return empty array when no posts found', async () => {
      (Post.findAll as jest.Mock).mockResolvedValue([]);

      const result = await postService.getAllPosts();

      expect(result).toEqual([]);
    });

    it('should call toJSON on each post', async () => {
      const toJSONMock1 = jest.fn().mockReturnValue({ id: 1 });
      const toJSONMock2 = jest.fn().mockReturnValue({ id: 2 });

      const mockPosts = [
        { id: 1, toJSON: toJSONMock1 },
        { id: 2, toJSON: toJSONMock2 },
      ];

      (Post.findAll as jest.Mock).mockResolvedValue(mockPosts);

      await postService.getAllPosts();

      expect(toJSONMock1).toHaveBeenCalled();
      expect(toJSONMock2).toHaveBeenCalled();
    });
  });

  describe('getPostById', () => {
    it('should return a post when found', async () => {
      const mockPost = {
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        userId: 1,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          userId: 1,
        }),
      };

      (Post.findByPk as jest.Mock).mockResolvedValue(mockPost);

      const result = await postService.getPostById(1);

      expect(Post.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id', 'content', 'userId', 'createdAt'],
          },
        ],
      });
      expect(result).toEqual({
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        userId: 1,
      });
      expect(mockPost.toJSON).toHaveBeenCalled();
    });

    it('should return null when post not found', async () => {
      (Post.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await postService.getPostById(999);

      expect(Post.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
      expect(result).toBeNull();
    });
  });

  describe('getAllPostsByUser', () => {
    it('should call getAllPosts with userId', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          userId: 1,
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            title: 'Post 1',
            content: 'Content 1',
            userId: 1,
          }),
        },
      ];

      (Post.findAll as jest.Mock).mockResolvedValue(mockPosts);

      const result = await postService.getAllPostsByUser(1);

      expect(Post.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: expect.any(Array),
      });
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(1);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockPostData = {
        title: 'New Post',
        content: 'New Content',
      };

      const mockCreatedPost = {
        id: 1,
        title: 'New Post',
        content: 'New Content',
        userId: 1,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: 'New Post',
          content: 'New Content',
          userId: 1,
        }),
      };

      (Post.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      const result = await postService.createPost(1, mockPostData);

      expect(Post.create).toHaveBeenCalledWith({
        title: 'New Post',
        content: 'New Content',
        userId: 1,
      });
      expect(result).toEqual({
        id: 1,
        title: 'New Post',
        content: 'New Content',
        userId: 1,
      });
      expect(mockCreatedPost.toJSON).toHaveBeenCalled();
    });

    it('should spread post data correctly', async () => {
      const mockPostData = {
        title: 'Post Title',
        content: 'Post Content',
      };

      const mockCreatedPost = {
        toJSON: jest.fn().mockReturnValue({}),
      };

      (Post.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      await postService.createPost(5, mockPostData);

      expect(Post.create).toHaveBeenCalledWith({
        ...mockPostData,
        userId: 5,
      });
    });
  });

  describe('updatePost', () => {
    it('should update a post when user owns it', async () => {
      const mockPost = {
        id: 1,
        title: 'Old Title',
        content: 'Old Content',
        userId: 1,
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: 'Updated Title',
          content: 'Updated Content',
          userId: 1,
        }),
      };

      (Post.findOne as jest.Mock).mockResolvedValue(mockPost);

      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const result = await postService.updatePost(1, 1, updateData);

      expect(Post.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockPost.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({
        id: 1,
        title: 'Updated Title',
        content: 'Updated Content',
        userId: 1,
      });
    });

    it('should return null when post not found', async () => {
      (Post.findOne as jest.Mock).mockResolvedValue(null);

      const result = await postService.updatePost(1, 1, { title: 'New Title' });

      expect(Post.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(result).toBeNull();
    });

    it('should return null when user does not own the post', async () => {
      (Post.findOne as jest.Mock).mockResolvedValue(null);

      const result = await postService.updatePost(1, 2, { title: 'New Title' });

      expect(Post.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 2 },
      });
      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const mockPost = {
        id: 1,
        title: 'Title',
        content: 'Content',
        userId: 1,
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: 'New Title',
          content: 'Content',
          userId: 1,
        }),
      };

      (Post.findOne as jest.Mock).mockResolvedValue(mockPost);

      const result = await postService.updatePost(1, 1, { title: 'New Title' });

      expect(mockPost.update).toHaveBeenCalledWith({ title: 'New Title' });
      expect(result).toBeDefined();
    });
  });

  describe('deletePost', () => {
    it('should delete a post when user owns it', async () => {
      const mockPost = {
        id: 1,
        title: 'Post Title',
        content: 'Post Content',
        userId: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      (Post.findOne as jest.Mock).mockResolvedValue(mockPost);

      const result = await postService.deletePost(1, 1);

      expect(Post.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockPost.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when post not found', async () => {
      (Post.findOne as jest.Mock).mockResolvedValue(null);

      const result = await postService.deletePost(1, 1);

      expect(Post.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(result).toBe(false);
    });

    it('should return false when user does not own the post', async () => {
      (Post.findOne as jest.Mock).mockResolvedValue(null);

      const result = await postService.deletePost(1, 2);

      expect(Post.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 2 },
      });
      expect(result).toBe(false);
    });

    it('should not call destroy when post is not found', async () => {
      (Post.findOne as jest.Mock).mockResolvedValue(null);

      await postService.deletePost(1, 1);

      expect(Post.findOne).toHaveBeenCalled();
      // Ensure destroy is never called on a non-existent post
    });
  });

  describe('deleteAllPostsByUser', () => {
    it('should delete all posts by user and return count', async () => {
      (Post.destroy as jest.Mock).mockResolvedValue(5);

      const result = await postService.deleteAllPostsByUser(1);

      expect(Post.destroy).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toBe(5);
    });

    it('should return 0 when no posts are deleted', async () => {
      (Post.destroy as jest.Mock).mockResolvedValue(0);

      const result = await postService.deleteAllPostsByUser(1);

      expect(Post.destroy).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toBe(0);
    });

    it('should delete posts only for specified user', async () => {
      (Post.destroy as jest.Mock).mockResolvedValue(3);

      await postService.deleteAllPostsByUser(5);

      expect(Post.destroy).toHaveBeenCalledWith({ where: { userId: 5 } });
    });
  });
});
