import { Router } from 'express';
import { requireAuth } from '@/modules/auth/auth.middleware';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from '@/modules/users/user.repository';

const router = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// All user routes require authentication
router.use(requireAuth);

// User routes
router.get('/profile', userController.getUserProfile);

// Notification settings routes
router.get('/notifications', userController.getNotificationSettings);
router.put('/notifications', userController.updateNotificationSettings);

export default router;
