import Comment from '../model';
import User from '@/modules/users/model';
import { CommentService } from '../services';
import { CreateCommentRequest, UpdateCommentRequest } from '../types';

// Mock the models
jest.mock('../model');
jest.mock('@/modules/users/model');

describe('CommentService', () => {
  let commentService: CommentService;

  beforeEach(() => {
    commentService = new CommentService();
    jest.clearAllMocks();
  });

  describe('getAllComments', () => {
    it('should return all comments without postId filter', async () => {
      const mockComments = [
        {
          id: 1,
          content: 'Comment 1',
          postId: 1,
          userId: 1,
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            content: 'Comment 1',
            postId: 1,
            userId: 1,
          }),
        },
        {
          id: 2,
          content: 'Comment 2',
          postId: 2,
          userId: 2,
          toJSON: jest.fn().mockReturnValue({
            id: 2,
            content: 'Comment 2',
            postId: 2,
            userId: 2,
          }),
        },
      ];

      (Comment.findAll as jest.Mock).mockResolvedValue(mockComments);

      const result = await commentService.getAllComments();

      expect(Comment.findAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      expect(result).toHaveLength(2);
      expect(mockComments[0].toJSON).toHaveBeenCalled();
      expect(mockComments[1].toJSON).toHaveBeenCalled();
    });

    it('should filter comments by postId when provided', async () => {
      const mockComments = [
        {
          id: 1,
          content: 'Comment 1',
          postId: 1,
          userId: 1,
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            content: 'Comment 1',
            postId: 1,
            userId: 1,
          }),
        },
      ];

      (Comment.findAll as jest.Mock).mockResolvedValue(mockComments);

      const result = await commentService.getAllComments(1);

      expect(Comment.findAll).toHaveBeenCalledWith({
        where: { postId: 1 },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      expect(result).toHaveLength(1);
      expect(result[0].postId).toBe(1);
    });

    it('should return empty array when no comments found', async () => {
      (Comment.findAll as jest.Mock).mockResolvedValue([]);

      const result = await commentService.getAllComments();

      expect(result).toEqual([]);
    });

    it('should include author information in results', async () => {
      const mockComments = [
        {
          id: 1,
          content: 'Comment 1',
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            content: 'Comment 1',
            author: { id: 1, username: 'user1', email: 'user1@gmail.com' },
          }),
        },
      ];

      (Comment.findAll as jest.Mock).mockResolvedValue(mockComments);

      const result = await commentService.getAllComments();

      expect((result[0] as any).author).toBeDefined();
    });
  });

  describe('getCommentById', () => {
    it('should return a comment when found', async () => {
      const mockComment = {
        id: 1,
        content: 'Test comment',
        postId: 1,
        userId: 1,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          content: 'Test comment',
          postId: 1,
          userId: 1,
        }),
      };

      (Comment.findByPk as jest.Mock).mockResolvedValue(mockComment);

      const result = await commentService.getCommentById(1);

      expect(Comment.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email'],
          },
        ],
      });
      expect(result).toEqual({
        id: 1,
        content: 'Test comment',
        postId: 1,
        userId: 1,
      });
      expect(mockComment.toJSON).toHaveBeenCalled();
    });

    it('should return null when comment not found', async () => {
      (Comment.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await commentService.getCommentById(999);

      expect(Comment.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
      expect(result).toBeNull();
    });
  });

  describe('getAllCommentsByPost', () => {
    it('should call getAllComments with postId', async () => {
      const mockComments = [
        {
          id: 1,
          content: 'Comment 1',
          postId: 1,
          toJSON: jest.fn().mockReturnValue({ id: 1, content: 'Comment 1', postId: 1 }),
        },
      ];

      (Comment.findAll as jest.Mock).mockResolvedValue(mockComments);

      const result = await commentService.getAllCommentsByPost(1);

      expect(Comment.findAll).toHaveBeenCalledWith({
        where: { postId: 1 },
        include: expect.any(Array),
        order: expect.any(Array),
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const mockComment = {
        id: 1,
        content: 'New comment',
        postId: 1,
        userId: 1,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          content: 'New comment',
          postId: 1,
          userId: 1,
        }),
      };

      (Comment.create as jest.Mock).mockResolvedValue(mockComment);

      const data: CreateCommentRequest = {
        content: 'New comment',
        postId: 1,
      };

      const result = await commentService.createComment(1, 1, data);

      expect(Comment.create).toHaveBeenCalledWith({
        content: 'New comment',
        postId: 1,
        userId: 1,
      });
      expect(result).toEqual({
        id: 1,
        content: 'New comment',
        postId: 1,
        userId: 1,
      });
      expect(mockComment.toJSON).toHaveBeenCalled();
    });

    it('should create comment with correct postId and userId', async () => {
      const mockComment = {
        id: 2,
        content: 'Another comment',
        postId: 5,
        userId: 3,
        toJSON: jest.fn().mockReturnValue({
          id: 2,
          content: 'Another comment',
          postId: 5,
          userId: 3,
        }),
      };

      (Comment.create as jest.Mock).mockResolvedValue(mockComment);

      const data: CreateCommentRequest = {
        content: 'Another comment',
        postId: 5,
      };

      const result = await commentService.createComment(5, 3, data);

      expect(Comment.create).toHaveBeenCalledWith({
        content: 'Another comment',
        postId: 5,
        userId: 3,
      });
      expect(result.postId).toBe(5);
      expect(result.userId).toBe(3);
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const mockComment = {
        id: 1,
        content: 'Original comment',
        postId: 1,
        userId: 1,
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          content: 'Updated comment',
          postId: 1,
          userId: 1,
        }),
      };

      (Comment.findOne as jest.Mock).mockResolvedValue(mockComment);

      const data: UpdateCommentRequest = {
        content: 'Updated comment',
      };

      const result = await commentService.updateComment(1, 1, data);

      expect(Comment.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockComment.update).toHaveBeenCalledWith(data);
      expect(result).toEqual({
        id: 1,
        content: 'Updated comment',
        postId: 1,
        userId: 1,
      });
      expect(mockComment.toJSON).toHaveBeenCalled();
    });

    it('should return null when comment not found', async () => {
      (Comment.findOne as jest.Mock).mockResolvedValue(null);

      const data: UpdateCommentRequest = {
        content: 'Updated comment',
      };

      const result = await commentService.updateComment(1, 1, data);

      expect(Comment.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(result).toBeNull();
    });

    it('should return null when comment belongs to different user', async () => {
      (Comment.findOne as jest.Mock).mockResolvedValue(null);

      const data: UpdateCommentRequest = {
        content: 'Updated comment',
      };

      const result = await commentService.updateComment(1, 2, data);

      expect(Comment.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 2 },
      });
      expect(result).toBeNull();
    });

    it('should not call update when comment not found', async () => {
      (Comment.findOne as jest.Mock).mockResolvedValue(null);

      const data: UpdateCommentRequest = {
        content: 'Updated comment',
      };

      await commentService.updateComment(1, 1, data);

      expect(Comment.findOne).toHaveBeenCalled();
      // No update should be called
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const mockComment = {
        id: 1,
        content: 'Comment to delete',
        postId: 1,
        userId: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      (Comment.findOne as jest.Mock).mockResolvedValue(mockComment);

      const result = await commentService.deleteComment(1, 1);

      expect(Comment.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when comment not found', async () => {
      (Comment.findOne as jest.Mock).mockResolvedValue(null);

      const result = await commentService.deleteComment(1, 1);

      expect(Comment.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(result).toBe(false);
    });

    it('should return false when comment belongs to different user', async () => {
      (Comment.findOne as jest.Mock).mockResolvedValue(null);

      const result = await commentService.deleteComment(1, 2);

      expect(Comment.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 2 },
      });
      expect(result).toBe(false);
    });

    it('should not call destroy when comment not found', async () => {
      (Comment.findOne as jest.Mock).mockResolvedValue(null);

      await commentService.deleteComment(1, 1);

      expect(Comment.findOne).toHaveBeenCalled();
      // No destroy should be called
    });
  });

  describe('deleteAllCommentsByPost', () => {
    it('should delete all comments by user for a post and return count', async () => {
      (Comment.destroy as jest.Mock).mockResolvedValue(3);

      const result = await commentService.deleteAllCommentsByPost(1, 1);

      expect(Comment.destroy).toHaveBeenCalledWith({
        where: { postId: 1, userId: 1 },
      });
      expect(result).toBe(3);
    });

    it('should return 0 when no comments are deleted', async () => {
      (Comment.destroy as jest.Mock).mockResolvedValue(0);

      const result = await commentService.deleteAllCommentsByPost(1, 1);

      expect(Comment.destroy).toHaveBeenCalledWith({
        where: { postId: 1, userId: 1 },
      });
      expect(result).toBe(0);
    });

    it('should only delete comments by the specified user', async () => {
      (Comment.destroy as jest.Mock).mockResolvedValue(2);

      await commentService.deleteAllCommentsByPost(1, 5);

      expect(Comment.destroy).toHaveBeenCalledWith({
        where: { postId: 1, userId: 5 },
      });
    });

    it('should filter by both postId and userId', async () => {
      (Comment.destroy as jest.Mock).mockResolvedValue(1);

      await commentService.deleteAllCommentsByPost(3, 7);

      expect(Comment.destroy).toHaveBeenCalledWith({
        where: { postId: 3, userId: 7 },
      });
    });
  });
});
