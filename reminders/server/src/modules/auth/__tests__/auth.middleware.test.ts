import { Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth } from '@/modules/auth/auth.middleware';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';

// Mock Clerk getAuth
jest.mock('@clerk/express', () => ({
  getAuth: jest.fn(),
}));

import { getAuth } from '@clerk/express';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockRequest = (overrides: Partial<Request> = {}): Request =>
  ({ ...overrides }) as unknown as Request;

const mockResponse = (): jest.Mocked<Response> => {
  const res = {} as jest.Mocked<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = (): jest.MockedFunction<NextFunction> => jest.fn();

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------
describe('requireAuth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next() and attaches auth when userId is present', () => {
    (getAuth as jest.Mock).mockReturnValue({
      userId: 'user_clerk_123',
      sessionId: 'session_abc',
      orgId: 'org_xyz',
    });
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).auth).toEqual({
      userId: 'user_clerk_123',
      sessionId: 'session_abc',
      orgId: 'org_xyz',
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when getAuth returns null', () => {
    (getAuth as jest.Mock).mockReturnValue(null);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      status: STATUS.ERROR,
      message: MESSAGES.UNAUTHORIZED_AUTH_REQUIRED,
    });
  });

  it('returns 401 when getAuth returns object without userId', () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null, sessionId: null });
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
  });

  it('returns 401 when getAuth returns empty object', () => {
    (getAuth as jest.Mock).mockReturnValue({});
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
  });

  it('attaches orgId and sessionId when present', () => {
    (getAuth as jest.Mock).mockReturnValue({
      userId: 'user_clerk_123',
      sessionId: 'session_abc',
      orgId: 'org_xyz',
    });
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    requireAuth(req, res, next);

    expect((req as any).auth.orgId).toBe('org_xyz');
    expect((req as any).auth.sessionId).toBe('session_abc');
  });
});

// ---------------------------------------------------------------------------
// optionalAuth
// ---------------------------------------------------------------------------
describe('optionalAuth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attaches auth and calls next() when userId is present', () => {
    (getAuth as jest.Mock).mockReturnValue({
      userId: 'user_clerk_123',
      sessionId: 'session_abc',
      orgId: undefined,
    });
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).auth).toEqual({
      userId: 'user_clerk_123',
      sessionId: 'session_abc',
      orgId: undefined,
    });
  });

  it('calls next() without attaching auth when getAuth returns null', () => {
    (getAuth as jest.Mock).mockReturnValue(null);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).auth).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() without attaching auth when userId is missing', () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).auth).toBeUndefined();
  });

  it('never blocks the request regardless of auth state', () => {
    (getAuth as jest.Mock).mockReturnValue(null);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    optionalAuth(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
