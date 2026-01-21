import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { ReminderService } from '@/modules/reminders/reminder.service';

/**
 * Reminder Controller
 * Handles all reminder-related HTTP requests
 */
export class ReminderController {
  private reminderService;

  constructor(reminderService: ReminderService) {
    this.reminderService = reminderService;
  }
  /**
   * Get all reminders for authenticated user
   * @route GET /api/v1/reminders?search=text&status=active|completed
   */
  getAllReminders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const { search, status } = req.query;

      // Validate status parameter
      const validStatus = status === 'active' || status === 'completed' ? status : undefined;

      const reminders = await this.reminderService.findByUserId(
        userId,
        search as string | undefined,
        validStatus
      );

      res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        data: {
          reminders,
        },
      });
    } catch (error) {
      console.error('Error fetching reminders:', error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to fetch reminders',
      });
    }
  };

  /**
   * Get reminder by ID
   * @route GET /api/v1/reminders/:id
   */
  getReminderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const reminder = await this.reminderService.findById(Number(id));

      res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        data: {
          reminder,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reminder';
      const statusCode = errorMessage.includes('not found')
        ? HTTP_STATUS_CODES.NOT_FOUND
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error fetching reminder:', error);
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
      });
    }
  };

  /**
   * Create new reminder
   * @route POST /api/v1/reminders
   */
  createReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const reminder = await this.reminderService.create(userId, req.body);

      res.status(HTTP_STATUS_CODES.CREATED).json({
        status: 'success',
        data: {
          reminder,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create reminder';
      const statusCode = errorMessage.includes('required')
        ? HTTP_STATUS_CODES.BAD_REQUEST
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error creating reminder:', error);
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
      });
    }
  };

  /**
   * Update reminder
   * @route PUT /api/v1/reminders/:id
   */
  updateReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const reminder = await this.reminderService.update(Number(id), req.body);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        data: {
          reminder,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update reminder';
      const statusCode = errorMessage.includes('not found')
        ? HTTP_STATUS_CODES.NOT_FOUND
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error updating reminder:', error);
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
      });
    }
  };

  /**
   * Delete reminder
   * @route DELETE /api/v1/reminders/:id
   */
  deleteReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      await this.reminderService.delete(Number(id));

      res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        data: {
          message: 'Reminder deleted successfully',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete reminder';
      const statusCode = errorMessage.includes('not found')
        ? HTTP_STATUS_CODES.NOT_FOUND
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error deleting reminder:', error);
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
      });
    }
  };

  /**
   * Get statistics for user's reminders
   * @route GET /api/v1/reminders/stats
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const stats = await this.reminderService.getStats(userId);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        data: {
          stats,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to fetch statistics',
      });
    }
  };
}
