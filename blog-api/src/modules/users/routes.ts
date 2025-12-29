import { Router } from 'express';
import { UserService } from './services';
import { UserController } from './controllers';
import { authenticateMiddleware } from '@/middlewares/authenticate';

// Create instances with explicit dependency injection
const userService = new UserService();
const userController = new UserController(userService);

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateMiddleware, userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateMiddleware, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update a user
 *     description: Update user information. Users can only update their own profile. Provide only the fields you want to update.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the user
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Updated username
 *                 example: johndoe_updated
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: john.updated@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password (will be hashed)
 *                 example: NewSecurePass123
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 1
 *               username: johndoe_updated
 *               email: john.updated@example.com
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   error: Invalid email format
 *               duplicateUsername:
 *                 summary: Username already taken
 *                 value:
 *                   error: Username already exists
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   error: Password must be at least 6 characters
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', authenticateMiddleware, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user
 *     description: Delete a user account. Users can only delete their own account. This will also delete all associated posts and comments.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the user to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: User deleted successfully (no content returned)
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: Invalid user ID format
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', authenticateMiddleware, userController.deleteUser);

/**
 * @swagger
 * /users:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete all users
 *     description: Delete all users from the database. This is a dangerous operation that should only be used in development/testing. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All users deleted successfully (no content returned)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin privileges required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *             example:
 *               error: Admin privileges required to delete all users
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/', authenticateMiddleware, userController.deleteAllUsers);

export default router;
export { userController };
