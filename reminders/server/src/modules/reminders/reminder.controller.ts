import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';
import { ReminderService } from '@/modules/reminders/reminder.service';
import { clerkClient } from '@clerk/express';
import { CreateReminder, UpdateReminder, UserData } from './reminder.types';
import logger from '@/configs/logger';

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
      if (status !== undefined && status !== 'active' && status !== 'completed') {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.INVALID_STATUS_PARAMETER,
        });
        return;
      }

      const validStatus = status === 'active' || status === 'completed' ? status : undefined;

      // Check if pagination is requested
      const shouldPaginate = page !== undefined || limit !== undefined;

      if (shouldPaginate) {
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);

        // Validate pagination parameters
        if (page !== undefined && (isNaN(pageNumber) || pageNumber < 1)) {
          res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            status: STATUS.ERROR,
            message: MESSAGES.PAGE_MUST_BE_POSITIVE,
          });
          return;
        }

        if (limit !== undefined && (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100)) {
          res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            status: STATUS.ERROR,
            message: MESSAGES.LIMIT_MUST_BE_VALID,
          });
          return;
        }

        const validPage = pageNumber || 1;
        const validLimit = limitNumber || 10;

        const { reminders, total } = await this.reminderService.findByUserIdPaginated(
          userId,
          validPage,
          validLimit,
          search as string | undefined,
          validStatus
        );

        const totalPages = Math.ceil(total / validLimit);

        res.status(HTTP_STATUS_CODES.OK).json({
          status: STATUS.SUCCESS,
          data: {
            reminders,
          },
          pagination: {
            page: validPage,
            limit: validLimit,
            total,
            totalPages,
            hasNextPage: validPage < totalPages,
            hasPreviousPage: validPage > 1,
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
      logger.error('Error fetching reminders:', error);
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

      // Validate ID
      const reminderId = parseInt(id);
      if (isNaN(reminderId) || reminderId <= 0) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.INVALID_REMINDER_ID,
        });
        return;
      }

      const reminder = await this.reminderService.findById(reminderId);

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

      logger.error('Error fetching reminder:', error);
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

      // Validate request body
      const { title, description, scheduled_at } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.TITLE_REQUIRED,
        });
        return;
      }

      if (!scheduled_at) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.SCHEDULED_DATE_REQUIRED,
        });
        return;
      }

      // Validate scheduled_at is a valid date
      const scheduledDate = new Date(scheduled_at);
      if (isNaN(scheduledDate.getTime())) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.INVALID_SCHEDULED_DATE_FORMAT,
        });
        return;
      }

      // Validate scheduled date is in the future
      if (scheduledDate <= new Date()) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.REMINDER_FUTURE_DATE_REQUIRED,
        });
        return;
      }

      // Validate description if provided
      if (description !== undefined && typeof description !== 'string') {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.DESCRIPTION_MUST_BE_STRING,
        });
        return;
      }

      // Get user info from Clerk
      let clerkUser;
      try {
        clerkUser = await clerkClient.users.getUser(userId);
      } catch (error) {
        logger.error('Error fetching user from Clerk:', error);
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: STATUS.ERROR,
          message: MESSAGES.FAILED_FETCH_USER_INFO,
        });
        return;
      }

      // Extract user data
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
      const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

      if (!userEmail) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.USER_EMAIL_NOT_FOUND,
        });
        return;
      }

      const reminderData: CreateReminder = {
        title: title.trim(),
        description: description?.trim(),
        scheduled_at: scheduledDate,
      };

      const userData: UserData = {
        email: userEmail,
        name: userName,
      };

      const reminder = await this.reminderService.create(userId, reminderData, userData);

      res.status(HTTP_STATUS_CODES.CREATED).json({
        status: STATUS.SUCCESS,
        data: {
          reminder,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.FAILED_CREATE_REMINDER;

      logger.error('Error creating reminder:', error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
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

      // Validate ID
      const reminderId = parseInt(id);
      if (isNaN(reminderId) || reminderId <= 0) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.INVALID_REMINDER_ID,
        });
        return;
      }

      // Validate request body
      const { title, description, scheduled_at } = req.body;

      // Check if at least one field is being updated
      if (title === undefined && description === undefined && scheduled_at === undefined) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.AT_LEAST_ONE_FIELD_REQUIRED,
        });
        return;
      }

      // Validate title if provided
      if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.TITLE_MUST_BE_NON_EMPTY,
        });
        return;
      }

      // Validate description if provided
      if (description !== undefined && typeof description !== 'string') {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.DESCRIPTION_MUST_BE_STRING,
        });
        return;
      }

      // Validate scheduled_at if provided
      let scheduledDate: Date | undefined;
      if (scheduled_at !== undefined) {
        scheduledDate = new Date(scheduled_at);
        if (isNaN(scheduledDate.getTime())) {
          res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            status: STATUS.ERROR,
            message: MESSAGES.INVALID_SCHEDULED_DATE_FORMAT,
          });
          return;
        }
      }

      const updateData: UpdateReminder = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (scheduledDate !== undefined) updateData.scheduled_at = scheduledDate;

      const reminder = await this.reminderService.update(reminderId, updateData);

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
        : errorMessage.includes('future') || errorMessage.includes('date')
          ? HTTP_STATUS_CODES.BAD_REQUEST
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

      logger.error('Error updating reminder:', error);
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

      // Validate ID
      const reminderId = parseInt(id);
      if (isNaN(reminderId) || reminderId <= 0) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: MESSAGES.INVALID_REMINDER_ID,
        });
        return;
      }

      await this.reminderService.delete(reminderId);

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

      logger.error('Error deleting reminder:', error);
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
      logger.error('Error fetching stats:', error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: STATUS.ERROR,
        message: MESSAGES.FAILED_FETCH_STATISTICS,
      });
    }
  };
}
