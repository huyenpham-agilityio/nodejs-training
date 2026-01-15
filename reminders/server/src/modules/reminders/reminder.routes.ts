import { Router } from 'express';
import { requireAuth } from '@/modules/auth/auth.middleware';
import * as reminderController from './reminder.controller';

const router = Router();

// All reminder routes require authentication
router.use(requireAuth);

// Reminder CRUD routes
router.get('/', reminderController.getAllReminders);
router.get('/:id', reminderController.getReminderById);
router.post('/', reminderController.createReminder);
router.put('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

export default router;
