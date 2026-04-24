import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'reflect-metadata';
import { clerkMiddleware } from '@clerk/express';
import dayjs from 'dayjs';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';

import swaggerSpec from '@/configs/swagger';
import { morganStream } from '@/configs/logger';

import { HTTP_STATUS_CODES } from '@/constants/http';
import { MESSAGES } from '@/constants/messages';
import { STATUS } from '@/constants/status';
import userRoutes from '@/modules/users/user.routes';
import reminderRoutes from '@/modules/reminders/reminder.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// HTTP request logging with Morgan
const isDevelopment = process.env.NODE_ENV !== 'production';
app.use(
  morgan(isDevelopment ? 'dev' : 'combined', {
    stream: morganStream,
  })
);

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API server is running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Server is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2026-01-27T12:00:00Z'
 */
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
