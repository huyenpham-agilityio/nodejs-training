import { Request, Response } from 'express';
import { PostService } from './services';
import { CreatePostRequest, UpdatePostRequest } from './types';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

// Helper to get user ID
const getUserId = (req: Request): number => (req.user as any).id;

export class PostController {
  private postService: PostService;

  constructor(postService?: PostService) {
    this.postService = postService || new PostService();
  }

  /**
   * Get all posts or filter by userId
   */
  getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userIdParam = req.query.userId as string | undefined;
      let userId: number | undefined;

      if (userIdParam) {
        userId = parseInt(userIdParam, 10);
        if (isNaN(userId)) {
          res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            error: MESSAGES.USER.INVALID_ID,
          });
          return;
        }
      }

      const posts = await this.postService.getAllPosts(userId);
      res.status(HTTP_STATUS_CODES.OK).json(posts);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.POST.RETRIEVE_FAILED,
      });
    }
  };

  /**
   * Get a single post by ID
   */
  getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.id, 10);

      if (isNaN(postId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.POST.INVALID_ID,
        });
        return;
      }

      const post = await this.postService.getPostById(postId);

      if (!post) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.POST.NOT_FOUND,
        });
        return;
      }

      res.status(HTTP_STATUS_CODES.OK).json(post);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.POST.RETRIEVE_FAILED,
      });
    }
  };

  /**
   * Get all posts by a user (deprecated - use getAllPosts with userId query param)
   */
  getAllPostsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId, 10);

      if (isNaN(userId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.USER.INVALID_ID,
        });
        return;
      }

      const posts = await this.postService.getAllPostsByUser(userId);
      res.status(HTTP_STATUS_CODES.OK).json(posts);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.POST.RETRIEVE_FAILED,
      });
    }
  };

  /**
   * Create a new post
   */
  createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const data: CreatePostRequest = req.body;

      if (!data.title || !data.content) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.POST.REQUIRED_FIELDS,
        });
        return;
      }

      const post = await this.postService.createPost(getUserId(req), data);
      res.status(HTTP_STATUS_CODES.CREATED).json(post);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: error.message });
      } else {
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          error: MESSAGES.POST.CREATE_FAILED,
        });
      }
    }
  };

  /**
   * Update a post
   */
  updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const postId = parseInt(req.params.id, 10);

      if (isNaN(postId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.POST.INVALID_ID,
        });
        return;
      }

      const data: UpdatePostRequest = req.body;
      const post = await this.postService.updatePost(postId, getUserId(req), data);

      if (!post) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.POST.NOT_FOUND,
        });
        return;
      }

      res.status(HTTP_STATUS_CODES.OK).json(post);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: error.message });
      } else {
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          error: MESSAGES.POST.UPDATE_FAILED,
        });
      }
    }
  };

  /**
   * Delete a post
   */
  deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const postId = parseInt(req.params.id, 10);

      if (isNaN(postId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.POST.INVALID_ID,
        });
        return;
      }

      const deleted = await this.postService.deletePost(postId, getUserId(req));

      if (!deleted) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.POST.NOT_FOUND_DELETE,
        });
        return;
      }

      res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.POST.DELETE_FAILED,
      });
    }
  };

  /**
   * Delete all posts by a user
   */
  deleteAllPostsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const count = await this.postService.deleteAllPostsByUser(getUserId(req));
      res.status(HTTP_STATUS_CODES.OK).json({
        message: MESSAGES.POST.DELETED_SUCCESS(count),
        count,
      });
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.POST.DELETE_ALL_FAILED,
      });
    }
  };
}
