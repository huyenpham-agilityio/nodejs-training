import { Request, Response } from 'express';
import { CommentService } from './services';
import { CreateCommentRequest, UpdateCommentRequest } from './types';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

// Helper to get user ID
const getUserId = (req: Request): number => (req.user as any).id;

export class CommentController {
  private commentService: CommentService;

  constructor(commentService?: CommentService) {
    this.commentService = commentService || new CommentService();
  }

  /**
   * Get all comments or filter by postId
   */
  getAllComments = async (req: Request, res: Response): Promise<void> => {
    try {
      // Support both query parameter and body
      const postIdParam = (req.query.postId || req.body.postId) as string | number | undefined;
      let postId: number | undefined;

      if (postIdParam) {
        postId = typeof postIdParam === 'string' ? parseInt(postIdParam, 10) : postIdParam;
        if (isNaN(postId)) {
          res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            error: MESSAGES.POST.INVALID_ID,
          });
          return;
        };
      };

      const comments = await this.commentService.getAllComments(postId);
      res.status(HTTP_STATUS_CODES.OK).json(comments);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.COMMENT.RETRIEVE_FAILED,
      });
    };
  };

  /**
   * Get a single comment by ID
   */
  getCommentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id, 10);

      if (isNaN(commentId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.COMMENT.INVALID_ID,
        });
        return;
      };

      const comment = await this.commentService.getCommentById(commentId);

      if (!comment) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.COMMENT.NOT_FOUND,
        });
        return;
      };

      res.status(HTTP_STATUS_CODES.OK).json(comment);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.COMMENT.RETRIEVE_FAILED,
      });
    };
  };

  /**
   * Get all comments of a post (deprecated - use getAllComments with postId query param)
   */
  getAllCommentsByPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.postId, 10);

      if (isNaN(postId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.POST.INVALID_ID,
        });
        return;
      };

      const comments = await this.commentService.getAllCommentsByPost(postId);
      res.status(HTTP_STATUS_CODES.OK).json(comments);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.COMMENT.RETRIEVE_FAILED,
      });
    };
  };

  /**
   * Create a new comment
   */
  createComment = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      };

      const data: CreateCommentRequest = req.body;

      if (!data.content || !data.postId) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.COMMENT.REQUIRED_FIELDS,
        });
        return;
      };

      const postId = typeof data.postId === 'string' ? parseInt(data.postId, 10) : data.postId;

      if (isNaN(postId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.POST.INVALID_ID,
        });
        return;
      };

      const comment = await this.commentService.createComment(postId, getUserId(req), data);
      res.status(HTTP_STATUS_CODES.CREATED).json(comment);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: error.message });
      } else {
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          error: MESSAGES.COMMENT.CREATE_FAILED,
        });
      };
    };
  };

  /**
   * Update a comment
   */
  updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      };

      const commentId = parseInt(req.params.id, 10);

      if (isNaN(commentId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.COMMENT.INVALID_ID,
        });
        return;
      };

      const data: UpdateCommentRequest = req.body;

      if (!data.content) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.COMMENT.REQUIRED_FIELDS,
        });
        return;
      };

      const comment = await this.commentService.updateComment(commentId, getUserId(req), data);

      if (!comment) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.COMMENT.NOT_FOUND,
        });
        return;
      };

      res.status(HTTP_STATUS_CODES.OK).json(comment);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: error.message });
      } else {
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          error: MESSAGES.COMMENT.UPDATE_FAILED,
        });
      };
    };
  };

  /**
   * Delete a comment
   */
  deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      };

      const commentId = parseInt(req.params.id, 10);

      if (isNaN(commentId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.COMMENT.INVALID_ID,
        });
        return;
      };

      const deleted = await this.commentService.deleteComment(commentId, getUserId(req));

      if (!deleted) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.COMMENT.NOT_FOUND_DELETE,
        });
        return;
      };

      res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.COMMENT.DELETE_FAILED,
      });
    };
  };

  /**
   * Delete all comments of a post by the authenticated user
   */
  deleteAllCommentsByPost = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          error: MESSAGES.UNAUTHORIZED,
        });
        return;
      };

      const postIdParam = req.body.postId;

      if (!postIdParam) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: 'Post ID is required',
        });
        return;
      };

      const postId = typeof postIdParam === 'string' ? parseInt(postIdParam, 10) : postIdParam;

      if (isNaN(postId)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.POST.INVALID_ID,
        });
        return;
      };

      const count = await this.commentService.deleteAllCommentsByPost(postId, getUserId(req));
      res.status(HTTP_STATUS_CODES.OK).json({
        message: MESSAGES.COMMENT.DELETED_SUCCESS(count),
        count,
      });
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.COMMENT.DELETE_ALL_FAILED,
      });
    };
  };
}
