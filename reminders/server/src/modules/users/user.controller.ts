import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';
import { UserService } from './user.service';
import { UpdateNotificationPreferences } from './user.types';
import logger from '@/configs/logger';

/**
 * User Controller
 * Handles all user-related HTTP requests
 */
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }
  /**
   * Get current user profile
   * @route GET /api/v1/users/profile
   * @requires authentication via Clerk JWT
   */
  getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED_NO_USER_ID,
        });
        return;
      }

      // Find or create user in database
      const user = await this.userService.findOrCreateByClerkId(userId);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: STATUS.SUCCESS,
        data: {
          user,
        },
      });
    } catch (error) {
      logger.error('Error fetching user profile:', error);

      const errorMessage =
        error instanceof Error ? error.message : MESSAGES.FAILED_FETCH_USER_PROFILE;

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: STATUS.ERROR,
        message: errorMessage,
      });
    }
  };

  /**
   * Get user notification settings
   * @route GET /api/v1/users/notifications
   * @requires authentication via Clerk JWT
   */
  getNotificationSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED_NO_USER_ID,
        });
        return;
      }

      const settings = await this.userService.getNotificationSettings(userId);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: STATUS.SUCCESS,
        data: {
          settings,
        },
      });
    } catch (error) {
      logger.error('Error fetching notification preferences:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch notification settings';

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: STATUS.ERROR,
        message: errorMessage,
      });
    }
  };

  /**
   * Update user notification settings
   * @route PUT /api/v1/users/notifications
   * @requires authentication via Clerk JWT
   */
  updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: STATUS.ERROR,
          message: MESSAGES.UNAUTHORIZED_NO_USER_ID,
        });
        return;
      }

      const { email_notifications_enabled, slack_notifications_enabled } = req.body;

      // Validate that at least one setting field is provided
      if (email_notifications_enabled === undefined && slack_notifications_enabled === undefined) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: STATUS.ERROR,
          message: 'At least one notification setting must be provided',
        });
        return;
      }

      // Validate boolean types
      const validateBoolean = (value: unknown, fieldName: string): boolean => {
        if (value !== undefined && typeof value !== 'boolean') {
          throw new Error(`${fieldName} must be a boolean value`);
        }
        return true;
      };

      validateBoolean(email_notifications_enabled, 'email_notifications_enabled');
      validateBoolean(slack_notifications_enabled, 'slack_notifications_enabled');

      const settings: UpdateNotificationPreferences = {};
      if (email_notifications_enabled !== undefined) {
        settings.email_notifications_enabled = email_notifications_enabled;
      }
      if (slack_notifications_enabled !== undefined) {
        settings.slack_notifications_enabled = slack_notifications_enabled;
      }

      const updatedUser = await this.userService.updateNotificationSettings(userId, settings);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: STATUS.SUCCESS,
        data: {
          user: updatedUser,
        },
        message: 'Notification settings updated successfully',
      });
    } catch (error) {
      logger.error('Error updating notification settings:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update notification settings';

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: STATUS.ERROR,
        message: errorMessage,
      });
    }
  };
}
