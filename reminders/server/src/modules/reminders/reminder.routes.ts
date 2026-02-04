import { Router } from 'express';
import { requireAuth } from '@/modules/auth/auth.middleware';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { ReminderRepository } from '@/modules/reminders/reminder.repository';

const router = Router();
const reminderRepository = new ReminderRepository();
const reminderService = new ReminderService(reminderRepository);
const reminderController = new ReminderController(reminderService);

// All reminder routes require authentication
router.use(requireAuth);

// Reminder statistics (must come before :id route)
router.get('/stats', reminderController.getStats);

// Reminder CRUD routes
router.get('/', reminderController.getAllReminders);
router.get('/:id', reminderController.getReminderById);
router.post('/', reminderController.createReminder);
router.put('/:id', reminderController.updateReminder);
router.patch('/:id/toggle', reminderController.toggleComplete);
router.delete('/:id', reminderController.deleteReminder);

export default router;
