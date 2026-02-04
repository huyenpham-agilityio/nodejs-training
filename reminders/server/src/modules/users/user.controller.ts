import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@/constants/http';

/**
 * User Controller
 * Handles all user-related HTTP requests
 */
export class UserController {
  /**
   * Get current user profile
   * @route GET /api/v1/users/me
   * @requires authentication via Clerk JWT
   */
  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      // TODO: Fetch user from database using clerk_user_id
      // const user = await this.userService.findByClerkId(userId);

      res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        data: {
          clerk_user_id: userId,
        },
      });
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to fetch user profile',
      });
    }
  };
}
