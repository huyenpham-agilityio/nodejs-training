import { Request, Response } from 'express';
import { PostController } from '../controllers';
import { PostService } from '../services';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

// Mock the PostService
jest.mock('../services');

describe('PostController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let postController: PostController;
  let mockPostService: jest.Mocked<PostService>;

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
    mockPostService = {
      getAllPosts: jest.fn(),
      getPostById: jest.fn(),
      getAllPostsByUser: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
      deleteAllPostsByUser: jest.fn(),
    } as any;

    // Create controller with mock service
    postController = new PostController(mockPostService);

    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return all posts when no userId is provided', async () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1', userId: 1 },
        { id: 2, title: 'Post 2', content: 'Content 2', userId: 2 },
      ];

      (mockPostService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      await postController.getAllPosts(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.getAllPosts).toHaveBeenCalledWith(undefined);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockPosts);
    });

    it('should filter posts by userId when provided', async () => {
      const mockPosts = [{ id: 1, title: 'Post 1', content: 'Content 1', userId: 1 }];
      mockRequest.query = { userId: '1' };

      (mockPostService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      await postController.getAllPosts(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.getAllPosts).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockPosts);
    });

    it('should return 400 when userId is invalid', async () => {
      mockRequest.query = { userId: 'invalid' };

      await postController.getAllPosts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.INVALID_ID });
      expect(mockPostService.getAllPosts).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an error', async () => {
      (mockPostService.getAllPosts as jest.Mock).mockRejectedValue(new Error('Database error'));

      await postController.getAllPosts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.RETRIEVE_FAILED });
    });
  });

  describe('getPostById', () => {
    it('should return a post when found', async () => {
      const mockPost = { id: 1, title: 'Post 1', content: 'Content 1', userId: 1 };
      mockRequest.params = { id: '1' };

      (mockPostService.getPostById as jest.Mock).mockResolvedValue(mockPost);

      await postController.getPostById(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.getPostById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockPost);
    });

    it('should return 404 when post not found', async () => {
      mockRequest.params = { id: '999' };

      (mockPostService.getPostById as jest.Mock).mockResolvedValue(null);

      await postController.getPostById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.NOT_FOUND });
    });

    it('should return 400 when post ID is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await postController.getPostById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.INVALID_ID });
      expect(mockPostService.getPostById).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { id: '1' };

      (mockPostService.getPostById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await postController.getPostById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.RETRIEVE_FAILED });
    });
  });

  describe('getAllPostsByUser', () => {
    it('should return all posts by a specific user', async () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1', userId: 1 },
        { id: 2, title: 'Post 2', content: 'Content 2', userId: 1 },
      ];
      mockRequest.params = { userId: '1' };

      (mockPostService.getAllPostsByUser as jest.Mock).mockResolvedValue(mockPosts);

      await postController.getAllPostsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.getAllPostsByUser).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockPosts);
    });

    it('should return 400 when userId is invalid', async () => {
      mockRequest.params = { userId: 'invalid' };

      await postController.getAllPostsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.USER.INVALID_ID });
      expect(mockPostService.getAllPostsByUser).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { userId: '1' };

      (mockPostService.getAllPostsByUser as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await postController.getAllPostsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.RETRIEVE_FAILED });
    });
  });

  describe('createPost', () => {
    it('should create a post when user is authenticated and data is valid', async () => {
      const mockPost = { id: 1, title: 'New Post', content: 'New Content', userId: 1 };
      mockRequest.user = { id: 1 } as any;
      mockRequest.body = { title: 'New Post', content: 'New Content' };

      (mockPostService.createPost as jest.Mock).mockResolvedValue(mockPost);

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.createPost).toHaveBeenCalledWith(1, {
        title: 'New Post',
        content: 'New Content',
      });
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
      expect(mockJson).toHaveBeenCalledWith(mockPost);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { title: 'New Post', content: 'New Content' };

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockPostService.createPost).not.toHaveBeenCalled();
    });

    it('should return 400 when title is missing', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.body = { content: 'New Content' };

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.REQUIRED_FIELDS });
      expect(mockPostService.createPost).not.toHaveBeenCalled();
    });

    it('should return 400 when content is missing', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.body = { title: 'New Post' };

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.REQUIRED_FIELDS });
      expect(mockPostService.createPost).not.toHaveBeenCalled();
    });

    it('should return 400 when service throws an Error instance', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.body = { title: 'New Post', content: 'New Content' };

      const error = new Error('Validation error');
      (mockPostService.createPost as jest.Mock).mockRejectedValue(error);

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Validation error' });
    });

    it('should return 500 when service throws a non-Error', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.body = { title: 'New Post', content: 'New Content' };

      (mockPostService.createPost as jest.Mock).mockRejectedValue('Unknown error');

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.CREATE_FAILED });
    });
  });

  describe('updatePost', () => {
    it('should update a post when user is authenticated and owns the post', async () => {
      const mockPost = { id: 1, title: 'Updated Post', content: 'Updated Content', userId: 1 };
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Post', content: 'Updated Content' };

      (mockPostService.updatePost as jest.Mock).mockResolvedValue(mockPost);

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.updatePost).toHaveBeenCalledWith(1, 1, {
        title: 'Updated Post',
        content: 'Updated Content',
      });
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith(mockPost);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Post' };

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockPostService.updatePost).not.toHaveBeenCalled();
    });

    it('should return 400 when post ID is invalid', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { title: 'Updated Post' };

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.INVALID_ID });
      expect(mockPostService.updatePost).not.toHaveBeenCalled();
    });

    it('should return 404 when post is not found or user does not own it', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Post' };

      (mockPostService.updatePost as jest.Mock).mockResolvedValue(null);

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.NOT_FOUND });
    });

    it('should return 400 when service throws an Error instance', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Post' };

      const error = new Error('Validation error');
      (mockPostService.updatePost as jest.Mock).mockRejectedValue(error);

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Validation error' });
    });

    it('should return 500 when service throws a non-Error', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Post' };

      (mockPostService.updatePost as jest.Mock).mockRejectedValue('Unknown error');

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.UPDATE_FAILED });
    });
  });

  describe('deletePost', () => {
    it('should delete a post when user is authenticated and owns the post', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: '1' };

      (mockPostService.deletePost as jest.Mock).mockResolvedValue(true);

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.deletePost).toHaveBeenCalledWith(1, 1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NO_CONTENT);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockPostService.deletePost).not.toHaveBeenCalled();
    });

    it('should return 400 when post ID is invalid', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: 'invalid' };

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.INVALID_ID });
      expect(mockPostService.deletePost).not.toHaveBeenCalled();
    });

    it('should return 404 when post is not found or user does not own it', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: '1' };

      (mockPostService.deletePost as jest.Mock).mockResolvedValue(false);

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.NOT_FOUND_DELETE });
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { id: '1' };

      (mockPostService.deletePost as jest.Mock).mockRejectedValue(new Error('Database error'));

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.DELETE_FAILED });
    });
  });

  describe('deleteAllPostsByUser', () => {
    it('should delete all posts by authenticated user', async () => {
      mockRequest.user = { id: 1 } as any;

      (mockPostService.deleteAllPostsByUser as jest.Mock).mockResolvedValue(5);

      await postController.deleteAllPostsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockPostService.deleteAllPostsByUser).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: MESSAGES.POST.DELETED_SUCCESS(5),
        count: 5,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await postController.deleteAllPostsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.UNAUTHORIZED });
      expect(mockPostService.deleteAllPostsByUser).not.toHaveBeenCalled();
    });

    it('should handle when no posts are deleted (count = 0)', async () => {
      mockRequest.user = { id: 1 } as any;

      (mockPostService.deleteAllPostsByUser as jest.Mock).mockResolvedValue(0);

      await postController.deleteAllPostsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockJson).toHaveBeenCalledWith({
        message: MESSAGES.POST.DELETED_SUCCESS(0),
        count: 0,
      });
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.user = { id: 1 } as any;

      (mockPostService.deleteAllPostsByUser as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await postController.deleteAllPostsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ error: MESSAGES.POST.DELETE_ALL_FAILED });
    });
  });
});
