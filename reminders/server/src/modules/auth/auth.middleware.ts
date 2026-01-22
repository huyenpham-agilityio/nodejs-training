import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';

/**
 * Middleware to require authentication for protected routes
 * Uses Clerk JWT to verify the user session
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);

  if (!auth?.userId) {
    res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
      status: STATUS.ERROR,
      message: MESSAGES.UNAUTHORIZED_AUTH_REQUIRED,
    });
    return;
  }

  // Attach user info to request for downstream use
  req.auth = {
    userId: auth.userId,
    sessionId: auth.sessionId,
    orgId: auth.orgId,
  };

  next();
};

/**
 * Optional auth middleware - doesn't block unauthenticated requests
 * but attaches auth info if available
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const auth = getAuth(req);

  if (auth?.userId) {
    req.auth = {
      userId: auth.userId,
      sessionId: auth.sessionId,
      orgId: auth.orgId,
    };
  }

  next();
};
