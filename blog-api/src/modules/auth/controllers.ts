import { Request, Response } from 'express';
import { AuthService } from './services';
import { SignUpRequest, SignInRequest } from './types';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';

export class AuthController {
  constructor(private authService: AuthService) {}

  signUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: SignUpRequest = req.body;

      // Validate required fields
      if (!data.username || !data.email || !data.password) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.AUTH.SIGNUP_REQUIRED_FIELDS,
        });
        return;
      }

      const result = await this.authService.signUp(data);
      res.status(HTTP_STATUS_CODES.CREATED).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: error.message });
      } else {
        res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
      }
    }
  };

  signIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: SignInRequest = req.body;

      // Validate required fields
      if (!data.email || !data.password) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: MESSAGES.AUTH.SIGNIN_REQUIRED_FIELDS,
        });
        return;
      }

      const result = await this.authService.signIn(data);
      res.status(HTTP_STATUS_CODES.OK).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ error: error.message });
      } else {
        res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
      }
    }
  };
}
