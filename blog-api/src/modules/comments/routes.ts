import { Router } from 'express';
import { CommentService } from './services';
import { CommentController } from './controllers';
import { authenticateMiddleware } from '@/middlewares/authenticate';

// Create instances with explicit dependency injection
const commentService = new CommentService();
const commentController = new CommentController(commentService);

const router = Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments
 *     description: Retrieve all comments from the database. Optionally filter comments by a specific post ID.
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: integer
 *         description: Optional post ID to filter comments by post
 *         example: 1
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *             example:
 *               - id: 1
 *                 content: Great post! Thanks for sharing.
 *                 postId: 1
 *                 userId: 2
 *                 createdAt: 2024-01-15T11:00:00.000Z
 *                 updatedAt: 2024-01-15T11:00:00.000Z
 *               - id: 2
 *                 content: Very informative article.
 *                 postId: 1
 *                 userId: 3
 *                 createdAt: 2024-01-15T12:30:00.000Z
 *                 updatedAt: 2024-01-15T12:30:00.000Z
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', commentController.getAllComments);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get a single comment by ID
 *     description: Retrieve detailed information about a specific comment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the comment
 *         example: 1
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *             example:
 *               id: 1
 *               content: Great post! Thanks for sharing.
 *               postId: 1
 *               userId: 2
 *               createdAt: 2024-01-15T11:00:00.000Z
 *               updatedAt: 2024-01-15T11:00:00.000Z
 *       400:
 *         description: Invalid comment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: Invalid comment ID format
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', commentController.getCommentById);

/**
 * @swagger
 * /comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     description: Create a new comment on a post. Requires authentication. The comment will be associated with the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the post to comment on (must exist)
 *                 example: 1
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Comment content (1-1000 characters)
 *                 example: Great post! Thanks for sharing.
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *             example:
 *               id: 1
 *               content: Great post! Thanks for sharing.
 *               postId: 1
 *               userId: 2
 *               createdAt: 2024-01-15T11:00:00.000Z
 *               updatedAt: 2024-01-15T11:00:00.000Z
 *       400:
 *         description: Validation error - Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missingPostId:
 *                 summary: Missing postId
 *                 value:
 *                   error: Post ID is required
 *               missingContent:
 *                 summary: Missing content
 *                 value:
 *                   error: Comment content is required
 *               invalidPostId:
 *                 summary: Invalid or non-existent post
 *                 value:
 *                   error: Post not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticateMiddleware, commentController.createComment);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment
 *     description: Update an existing comment. Only the comment author can update their own comments.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the comment to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Updated comment content
 *                 example: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *             example:
 *               id: 1
 *               content: Updated comment text
 *               postId: 1
 *               userId: 2
 *               createdAt: 2024-01-15T11:00:00.000Z
 *               updatedAt: 2024-01-15T13:00:00.000Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: Comment content is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', authenticateMiddleware, commentController.updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Delete a specific comment. Only the comment author can delete their own comments.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the comment to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: Comment deleted successfully (no content returned)
 *       400:
 *         description: Invalid comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: Invalid comment ID format
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', authenticateMiddleware, commentController.deleteComment);

/**
 * @swagger
 * /comments:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete all comments by the authenticated user for a specific post
 *     description: Delete all comments created by the currently authenticated user on a specific post. This action cannot be undone.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the post to delete comments from
 *                 example: 1
 *     responses:
 *       204:
 *         description: All user comments on the post deleted successfully (no content returned)
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: Post ID is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *             example:
 *               error: Post not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/', authenticateMiddleware, commentController.deleteAllCommentsByPost);

export default router;
export { commentController };
