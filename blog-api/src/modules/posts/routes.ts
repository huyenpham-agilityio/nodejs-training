import { Router } from 'express';
import { PostService } from './services';
import { PostController } from './controllers';
import { authenticateMiddleware } from '@/middlewares/authenticate';

// Create instances with explicit dependency injection
const postService = new PostService();
const postController = new PostController(postService);

const router = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get all posts
 *     description: Retrieve all posts from the database. Optionally filter posts by a specific user ID.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Optional user ID to filter posts by author
 *         example: 1
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *             example:
 *               - id: 1
 *                 title: My First Blog Post
 *                 content: This is the content of my first blog post
 *                 userId: 1
 *                 createdAt: 2024-01-15T10:30:00.000Z
 *                 updatedAt: 2024-01-15T10:30:00.000Z
 *               - id: 2
 *                 title: Another Post
 *                 content: More interesting content here
 *                 userId: 2
 *                 createdAt: 2024-01-16T14:20:00.000Z
 *                 updatedAt: 2024-01-16T14:20:00.000Z
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get a single post by ID
 *     description: Retrieve detailed information about a specific post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the post
 *         example: 1
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 1
 *               title: My First Blog Post
 *               content: This is the content of my first blog post
 *               userId: 1
 *               createdAt: 2024-01-15T10:30:00.000Z
 *               updatedAt: 2024-01-15T10:30:00.000Z
 *       400:
 *         description: Invalid post ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: Invalid post ID format
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', postController.getPostById);

/**
 * @swagger
 * /posts:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Create a new post
 *     description: Create a new blog post. Requires authentication. The post will be associated with the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Post title (1-255 characters)
 *                 example: My First Blog Post
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 description: Post content (at least 1 character)
 *                 example: This is the content of my first blog post
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 1
 *               title: My First Blog Post
 *               content: This is the content of my first blog post
 *               userId: 1
 *               createdAt: 2024-01-15T10:30:00.000Z
 *               updatedAt: 2024-01-15T10:30:00.000Z
 *       400:
 *         description: Validation error - Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missingTitle:
 *                 summary: Missing title
 *                 value:
 *                   error: Title is required
 *               missingContent:
 *                 summary: Missing content
 *                 value:
 *                   error: Content is required
 *               emptyFields:
 *                 summary: Empty fields
 *                 value:
 *                   error: Title and content cannot be empty
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticateMiddleware, postController.createPost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update a post
 *     description: Update an existing post. Only the post author can update their own posts. Provide only the fields you want to update.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the post to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Updated post title
 *                 example: Updated Blog Post Title
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 description: Updated post content
 *                 example: This is the updated content
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 1
 *               title: Updated Blog Post Title
 *               content: This is the updated content
 *               userId: 1
 *               createdAt: 2024-01-15T10:30:00.000Z
 *               updatedAt: 2024-01-15T12:45:00.000Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: At least one field (title or content) must be provided
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', authenticateMiddleware, postController.updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete a post
 *     description: Delete a specific post. Only the post author can delete their own posts.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the post to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: Post deleted successfully (no content returned)
 *       400:
 *         description: Invalid post ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: Invalid post ID format
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', authenticateMiddleware, postController.deletePost);

/**
 * @swagger
 * /posts:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete all posts by the authenticated user
 *     description: Delete all posts created by the currently authenticated user. This action cannot be undone.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All user posts deleted successfully (no content returned)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/', authenticateMiddleware, postController.deleteAllPostsByUser);

export default router;
export { postController };
