import dotenv from 'dotenv';
import 'reflect-metadata';
import app from './app';
import AppDataSource from './configs/database';
import { redisClient } from './configs/redis';
import logger from './configs/logger';
// Import worker to initialize it
import { notificationWorker } from './modules/notifications/workers/notification.worker';
import providerFactory from './modules/notifications/providers/provider.factory';

// Load environment variables
dotenv.config();

// Initialize notification providers after env vars are loaded
providerFactory.initialize();

const PORT = process.env.PORT || 3000;

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('✓ Database connection established');
    logger.info(`  Database: ${AppDataSource.options.database}`);
  } catch (error) {
    logger.error('✗ Error during database initialization:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Test Redis connection
    await redisClient.ping();

    // Log notification providers status
    const providers = providerFactory.getAllProviders();
    logger.info('\n📬 Notification Providers:');
    providers.forEach((provider) => {
      const status = provider.isConfigured() ? '✅ Enabled' : '⚠️  Disabled (not configured)';
      logger.info(`  ${status} - ${provider.name}`);
    });

    // Start Express server
    app.listen(PORT, () => {
      logger.info('----------------------------------');
      logger.info(`✓ Server is running on port ${PORT}`);
      logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`  API URL: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
      logger.info('----------------------------------');
    });
  } catch (error) {
    logger.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('\nShutting down gracefully...');

  try {
    // Close the worker first
    await notificationWorker.close();
    logger.info('✓ Notification worker closed');

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('✓ Database connection closed');
    }

    await redisClient.quit();
    logger.info('✓ Redis connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('✗ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();
