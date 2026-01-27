import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';
import { UserService } from '@/modules/users/user.service';

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
      console.error('Error fetching user profile:', error);

      const errorMessage =
        error instanceof Error ? error.message : MESSAGES.FAILED_FETCH_USER_PROFILE;

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: STATUS.ERROR,
        message: errorMessage,
      });
    }
  };
}
