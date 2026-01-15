import { Router } from 'express';
import { requireAuth } from '@/modules/auth/auth.middleware';
import * as userController from './user.controller';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// User routes
router.get('/me', userController.getMe);

export default router;
