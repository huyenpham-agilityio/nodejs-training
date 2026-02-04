import { Router } from 'express';
import { requireAuth } from '@/modules/auth/auth.middleware';
import { UserController } from './user.controller';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(requireAuth);

// User routes
router.get('/me', userController.getMe);

export default router;
