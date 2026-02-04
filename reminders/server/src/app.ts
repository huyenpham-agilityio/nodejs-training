import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'reflect-metadata';
import { clerkMiddleware } from '@clerk/express';
import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';
import userRoutes from '@/modules/users/user.routes';
import reminderRoutes from '@/modules/reminders/reminder.routes';
import dayjs from 'dayjs';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware - must be before routes
app.use(clerkMiddleware());

// Health check endpoint (no auth required)
app.get('/health', (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({
    status: STATUS.SUCCESS,
    message: MESSAGES.SERVER_HEALTHY,
    timestamp: dayjs().toISOString(),
  });
});

// API routes - all protected by Clerk JWT
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/reminders`, reminderRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
    status: STATUS.ERROR,
    message: MESSAGES.ROUTE_NOT_FOUND,
  });
});

export default app;
