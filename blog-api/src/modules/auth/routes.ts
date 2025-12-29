import { Router } from 'express';
import { AuthService } from './services';
import { AuthController } from './controllers';

// Create instances with explicit dependency injection
const authService = new AuthService();
const authController = new AuthController(authService);

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign up a new user
 *     description: Create a new user account with username, email, and password. All fields are required and must meet validation criteria.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Username must be unique and between 3-50 characters
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address (must be unique)
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Password must be at least 6 characters long
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: User successfully created and authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token for immediate use
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzOTU4MjQwMH0.xyz
 *               user:
 *                 id: 1
 *                 username: johndoe
 *                 email: john@example.com
 *       400:
 *         description: Bad request - Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   error: Validation failed
 *                   details:
 *                     - field: email
 *                       message: Invalid email format
 *                     - field: password
 *                       message: Password must be at least 6 characters
 *               duplicateUser:
 *                 summary: User already exists
 *                 value:
 *                   error: User with this email already exists
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: Username, email, and password are required
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/signup', authController.signUp);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign in to an existing account
 *     description: Authenticate a user with email and password to receive a JWT token for accessing protected endpoints
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registered email address
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token (use in Authorization header as "Bearer {token}")
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzOTU4MjQwMH0.xyz
 *               user:
 *                 id: 1
 *                 username: johndoe
 *                 email: john@example.com
 *       400:
 *         description: Bad request - Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missingEmail:
 *                 summary: Missing email
 *                 value:
 *                   error: Email is required
 *               missingPassword:
 *                 summary: Missing password
 *                 value:
 *                   error: Password is required
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   error: Invalid email format
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             examples:
 *               invalidCredentials:
 *                 summary: Wrong email or password
 *                 value:
 *                   error: Invalid email or password
 *               userNotFound:
 *                 summary: User does not exist
 *                 value:
 *                   error: User not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/signin', authController.signIn);

export default router;
