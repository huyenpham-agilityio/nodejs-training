import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import 'reflect-metadata';
import { HTTP_STATUS_CODES } from '@/constants/http';

dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Add all routes here

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
    status: 'error',
    message: 'Route not found',
  });
});

export default app;
