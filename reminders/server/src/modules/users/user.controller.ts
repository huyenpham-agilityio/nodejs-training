import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@/constants/http';

/**
 * Get current user profile
 * Requires authentication via Clerk JWT
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
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
    // const user = await userService.findByClerkId(userId);

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
