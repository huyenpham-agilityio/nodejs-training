import { Request, Response } from 'express';
import { UserService } from './services';
import { UpdateUserRequest } from './types';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

export class UserController {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || new UserService();
  }

  /**
   * Get all users
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(HTTP_STATUS_CODES.OK).json(users);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.USER.RETRIEVE_FAILED,
      });
    }
  };

  /**
   * Get a single user by ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.USER.INVALID_ID,
        });
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.USER.NOT_FOUND,
        });
        return;
      }

      res.status(HTTP_STATUS_CODES.OK).json(user);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.USER.RETRIEVE_ONE_FAILED,
      });
    }
  };

  /**
   * Update a user
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.USER.INVALID_ID,
        });
        return;
      }

      const data: UpdateUserRequest = req.body;
      const user = await this.userService.updateUser(id, data);

      if (!user) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.USER.NOT_FOUND,
        });
        return;
      }

      res.status(HTTP_STATUS_CODES.OK).json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: error.message });
      } else {
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          error: MESSAGES.USER.UPDATE_FAILED,
        });
      }
    }
  };

  /**
   * Delete a user
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.USER.INVALID_ID,
        });
        return;
      }

      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: MESSAGES.USER.NOT_FOUND,
        });
        return;
      }

      res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.USER.DELETE_FAILED,
      });
    }
  };

  /**
   * Delete all users
   */
  deleteAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.userService.deleteAllUsers();
      res.status(HTTP_STATUS_CODES.OK).json({
        message: MESSAGES.USER.DELETED_SUCCESS(count),
        count,
      });
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.USER.DELETE_ALL_FAILED,
      });
    }
  };
}
