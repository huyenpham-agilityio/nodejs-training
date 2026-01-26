import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';
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
   * @route GET /api/v1/reminders?search=text&status=active|completed&page=1&limit=10
   */
  getAllReminders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const { search, status, page, limit } = req.query;

      // Validate status parameter
      const validStatus = status === 'active' || status === 'completed' ? status : undefined;

      // Check if pagination is requested
      const shouldPaginate = page !== undefined || limit !== undefined;

      if (shouldPaginate) {
        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;

        const { reminders, total } = await this.reminderService.findByUserIdPaginated(
          userId,
          pageNumber,
          limitNumber,
          search as string | undefined,
          validStatus
        );

        const totalPages = Math.ceil(total / limitNumber);

        res.status(HTTP_STATUS_CODES.OK).json({
          status: STATUS.SUCCESS,
          data: {
            reminders,
          },
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
          },
        });
      } else {
        // Return all reminders without pagination (backward compatibility)
        const reminders = await this.reminderService.findByUserId(
          userId,
          search as string | undefined,
          validStatus
        );

        res.status(HTTP_STATUS_CODES.OK).json({
          status: STATUS.SUCCESS,
          data: {
            reminders,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: STATUS.ERROR,
        message: MESSAGES.FAILED_FETCH_REMINDERS,
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
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const reminder = await this.reminderService.findById(Number(id));

      res.status(HTTP_STATUS_CODES.OK).json({
        status: STATUS.SUCCESS,
        data: {
          reminder,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.FAILED_FETCH_REMINDER;
      const statusCode = errorMessage.includes('not found')
        ? HTTP_STATUS_CODES.NOT_FOUND
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error fetching reminder:', error);
      res.status(statusCode).json({
        status: STATUS.ERROR,
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
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const reminder = await this.reminderService.create(userId, req.body);

      res.status(HTTP_STATUS_CODES.CREATED).json({
        status: STATUS.SUCCESS,
        data: {
          reminder,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.FAILED_CREATE_REMINDER;
      const statusCode = errorMessage.includes('required')
        ? HTTP_STATUS_CODES.BAD_REQUEST
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error creating reminder:', error);
      res.status(statusCode).json({
        status: STATUS.ERROR,
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
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const reminder = await this.reminderService.update(Number(id), req.body);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: STATUS.SUCCESS,
        data: {
          reminder,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.FAILED_UPDATE_REMINDER;
      const statusCode = errorMessage.includes('not found')
        ? HTTP_STATUS_CODES.NOT_FOUND
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error updating reminder:', error);
      res.status(statusCode).json({
        status: STATUS.ERROR,
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
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      await this.reminderService.delete(Number(id));

      res.status(HTTP_STATUS_CODES.OK).json({
        status: STATUS.SUCCESS,
        data: {
          message: MESSAGES.REMINDER_DELETED_SUCCESS,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.FAILED_DELETE_REMINDER;
      const statusCode = errorMessage.includes('not found')
        ? HTTP_STATUS_CODES.NOT_FOUND
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      console.error('Error deleting reminder:', error);
      res.status(statusCode).json({
        status: STATUS.ERROR,
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
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const stats = await this.reminderService.getStats(userId);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: STATUS.SUCCESS,
        data: {
          stats,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: STATUS.ERROR,
        message: MESSAGES.FAILED_FETCH_STATISTICS,
      });
    }
  };
}
