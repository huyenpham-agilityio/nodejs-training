import { Request, Response, NextFunction } from 'express';
import passport from '@/middlewares/auth';
import { MESSAGES } from '@/constants/messages';
import { HTTP_STATUS_CODES } from '@/constants/http';

export const authenticate = passport.authenticate('jwt', { session: false });

export const authenticateMiddleware = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: Express.User | false) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.UNAUTHORIZED });
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};
