import { Request, Response } from 'express';
import { CommentController } from '../controllers';
import { CommentService } from '../services';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

// Mock the CommentService
jest.mock('../services');

describe('CommentController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let commentController: CommentController;
  let mockCommentService: jest.Mocked<CommentService>;

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
      user: { id: 1 } as any,
    };

    // Create mock service instance
    mockCommentService = {
      getAllComments: jest.fn(),
      getCommentById: jest.fn(),
      getAllCommentsByPost: jest.fn(),
      createComment: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
      deleteAllCommentsByPost: jest.fn(),
    } as any;

    // Create controller with mock service
    commentController = new CommentController(mockCommentService);

    jest.clearAllMocks();
  });

  describe('getAllComments', () => {
    it('should return all comments without postId filter', async () => {
      const mockComments = [
        { id: 1, content: 'Comment 1', postId: 1, userId: 1 },
        { id: 2, content: 'Comment 2', postId: 2, userId: 1 },
      ];

      (mockCommentService.getAllComments as jest.Mock).mockResolvedValue(mockComments);

      await commentController.getAllComments(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.getAllComments).toHaveBeenCalledWith(undefined);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockComments);
    });

    it('should filter comments by postId from query parameter', async () => {
      mockRequest.query = { postId: '1' };
      const mockComments = [{ id: 1, content: 'Comment 1', postId: 1, userId: 1 }];

      (mockCommentService.getAllComments as jest.Mock).mockResolvedValue(mockComments);

      await commentController.getAllComments(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.getAllComments).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockComments);
    });

    it('should filter comments by postId from body', async () => {
      mockRequest.body = { postId: 2 };
      const mockComments = [{ id: 2, content: 'Comment 2', postId: 2, userId: 1 }];

      (mockCommentService.getAllComments as jest.Mock).mockResolvedValue(mockComments);

      await commentController.getAllComments(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.getAllComments).toHaveBeenCalledWith(2);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockComments);
    });

    it('should return 400 when postId is invalid', async () => {
      mockRequest.query = { postId: 'invalid' };

      await commentController.getAllComments(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.INVALID_ID });
      expect(mockCommentService.getAllComments).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an error', async () => {
      (mockCommentService.getAllComments as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await commentController.getAllComments(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.RETRIEVE_FAILED });
    });
  });

  describe('getCommentById', () => {
    it('should return a comment when found', async () => {
      const mockComment = { id: 1, content: 'Test comment', postId: 1, userId: 1 };
      mockRequest.params = { id: '1' };

      (mockCommentService.getCommentById as jest.Mock).mockResolvedValue(mockComment);

      await commentController.getCommentById(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.getCommentById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockComment);
    });

    it('should return 404 when comment not found', async () => {
      mockRequest.params = { id: '999' };

      (mockCommentService.getCommentById as jest.Mock).mockResolvedValue(null);

      await commentController.getCommentById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.NOT_FOUND });
    });

    it('should return 400 when comment ID is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await commentController.getCommentById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.INVALID_ID });
      expect(mockCommentService.getCommentById).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { id: '1' };

      (mockCommentService.getCommentById as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await commentController.getCommentById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.RETRIEVE_FAILED });
    });
  });

  describe('getAllCommentsByPost', () => {
    it('should return all comments for a post', async () => {
      mockRequest.params = { postId: '1' };
      const mockComments = [
        { id: 1, content: 'Comment 1', postId: 1, userId: 1 },
        { id: 2, content: 'Comment 2', postId: 1, userId: 2 },
      ];

      (mockCommentService.getAllCommentsByPost as jest.Mock).mockResolvedValue(mockComments);

      await commentController.getAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockCommentService.getAllCommentsByPost).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockComments);
    });

    it('should return 400 when postId is invalid', async () => {
      mockRequest.params = { postId: 'invalid' };

      await commentController.getAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.INVALID_ID });
      expect(mockCommentService.getAllCommentsByPost).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { postId: '1' };

      (mockCommentService.getAllCommentsByPost as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await commentController.getAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.RETRIEVE_FAILED });
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const mockComment = { id: 1, content: 'New comment', postId: 1, userId: 1 };
      mockRequest.body = { content: 'New comment', postId: 1 };

      (mockCommentService.createComment as jest.Mock).mockResolvedValue(mockComment);

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.createComment).toHaveBeenCalledWith(1, 1, {
        content: 'New comment',
        postId: 1,
      });
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
      expect(mockJson).toHaveBeenCalledWith(mockComment);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { content: 'New comment', postId: 1 };

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockCommentService.createComment).not.toHaveBeenCalled();
    });

    it('should return 400 when content is missing', async () => {
      mockRequest.body = { postId: 1 };

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.REQUIRED_FIELDS });
      expect(mockCommentService.createComment).not.toHaveBeenCalled();
    });

    it('should return 400 when postId is missing', async () => {
      mockRequest.body = { content: 'New comment' };

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.REQUIRED_FIELDS });
      expect(mockCommentService.createComment).not.toHaveBeenCalled();
    });

    it('should return 400 when postId is invalid', async () => {
      mockRequest.body = { content: 'New comment', postId: 'invalid' };

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.INVALID_ID });
      expect(mockCommentService.createComment).not.toHaveBeenCalled();
    });

    it('should handle postId as string and convert to number', async () => {
      const mockComment = { id: 1, content: 'New comment', postId: 1, userId: 1 };
      mockRequest.body = { content: 'New comment', postId: '1' };

      (mockCommentService.createComment as jest.Mock).mockResolvedValue(mockComment);

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.createComment).toHaveBeenCalledWith(1, 1, {
        content: 'New comment',
        postId: '1',
      });
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
    });

    it('should return 400 when service throws an Error', async () => {
      mockRequest.body = { content: 'New comment', postId: 1 };

      (mockCommentService.createComment as jest.Mock).mockRejectedValue(
        new Error('Post not found'),
      );

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should return 500 when service throws a non-Error', async () => {
      mockRequest.body = { content: 'New comment', postId: 1 };

      (mockCommentService.createComment as jest.Mock).mockRejectedValue('Unknown error');

      await commentController.createComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.CREATE_FAILED });
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const mockComment = { id: 1, content: 'Updated comment', postId: 1, userId: 1 };
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated comment' };

      (mockCommentService.updateComment as jest.Mock).mockResolvedValue(mockComment);

      await commentController.updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.updateComment).toHaveBeenCalledWith(1, 1, {
        content: 'Updated comment',
      });
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockComment);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated comment' };

      await commentController.updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockCommentService.updateComment).not.toHaveBeenCalled();
    });

    it('should return 400 when comment ID is invalid', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { content: 'Updated comment' };

      await commentController.updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.INVALID_ID });
      expect(mockCommentService.updateComment).not.toHaveBeenCalled();
    });

    it('should return 400 when content is missing', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      await commentController.updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.REQUIRED_FIELDS });
      expect(mockCommentService.updateComment).not.toHaveBeenCalled();
    });

    it('should return 404 when comment not found', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated comment' };

      (mockCommentService.updateComment as jest.Mock).mockResolvedValue(null);

      await commentController.updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.NOT_FOUND });
    });

    it('should return 400 when service throws an Error', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated comment' };

      (mockCommentService.updateComment as jest.Mock).mockRejectedValue(
        new Error('Update validation failed'),
      );

      await commentController.updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Update validation failed' });
    });

    it('should return 500 when service throws a non-Error', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated comment' };

      (mockCommentService.updateComment as jest.Mock).mockRejectedValue('Unknown error');

      await commentController.updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.UPDATE_FAILED });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      mockRequest.params = { id: '1' };

      (mockCommentService.deleteComment as jest.Mock).mockResolvedValue(true);

      await commentController.deleteComment(mockRequest as Request, mockResponse as Response);

      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(1, 1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NO_CONTENT);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };

      await commentController.deleteComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockCommentService.deleteComment).not.toHaveBeenCalled();
    });

    it('should return 400 when comment ID is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await commentController.deleteComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.INVALID_ID });
      expect(mockCommentService.deleteComment).not.toHaveBeenCalled();
    });

    it('should return 404 when comment not found', async () => {
      mockRequest.params = { id: '1' };

      (mockCommentService.deleteComment as jest.Mock).mockResolvedValue(false);

      await commentController.deleteComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.NOT_FOUND_DELETE });
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { id: '1' };

      (mockCommentService.deleteComment as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await commentController.deleteComment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.DELETE_FAILED });
    });
  });

  describe('deleteAllCommentsByPost', () => {
    it('should delete all comments by user for a post', async () => {
      mockRequest.body = { postId: 1 };

      (mockCommentService.deleteAllCommentsByPost as jest.Mock).mockResolvedValue(3);

      await commentController.deleteAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockCommentService.deleteAllCommentsByPost).toHaveBeenCalledWith(1, 1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: MESSAGES.COMMENT.DELETED_SUCCESS(3),
        count: 3,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { postId: 1 };

      await commentController.deleteAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockCommentService.deleteAllCommentsByPost).not.toHaveBeenCalled();
    });

    it('should return 400 when postId is missing', async () => {
      mockRequest.body = {};

      await commentController.deleteAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Post ID is required' });
      expect(mockCommentService.deleteAllCommentsByPost).not.toHaveBeenCalled();
    });

    it('should return 400 when postId is invalid', async () => {
      mockRequest.body = { postId: 'invalid' };

      await commentController.deleteAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.INVALID_ID });
      expect(mockCommentService.deleteAllCommentsByPost).not.toHaveBeenCalled();
    });

    it('should handle postId as string and convert to number', async () => {
      mockRequest.body = { postId: '1' };

      (mockCommentService.deleteAllCommentsByPost as jest.Mock).mockResolvedValue(2);

      await commentController.deleteAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockCommentService.deleteAllCommentsByPost).toHaveBeenCalledWith(1, 1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
    });

    it('should return count 0 when no comments were deleted', async () => {
      mockRequest.body = { postId: 1 };

      (mockCommentService.deleteAllCommentsByPost as jest.Mock).mockResolvedValue(0);

      await commentController.deleteAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: MESSAGES.COMMENT.DELETED_SUCCESS(0),
        count: 0,
      });
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.body = { postId: 1 };

      (mockCommentService.deleteAllCommentsByPost as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await commentController.deleteAllCommentsByPost(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.COMMENT.DELETE_ALL_FAILED });
    });
  });
});
