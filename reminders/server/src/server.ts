import dotenv from 'dotenv';
import 'reflect-metadata';
import app from './app';
import AppDataSource from './configs/database';
import { redisClient } from './configs/redis';
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
    console.log('✓ Database connection established');
    console.log(`  Database: ${AppDataSource.options.database}`);
  } catch (error) {
    console.error('✗ Error during database initialization:', error);
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
    console.log('\n📬 Notification Providers:');
    providers.forEach((provider) => {
      const status = provider.isConfigured() ? '✅ Enabled' : '⚠️  Disabled (not configured)';
      console.log(`  ${status} - ${provider.name}`);
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log('----------------------------------');
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  API URL: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
      console.log('----------------------------------');
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...');

  try {
    // Close the worker first
    await notificationWorker.close();
    console.log('✓ Notification worker closed');

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✓ Database connection closed');
    }

    await redisClient.quit();
    console.log('✓ Redis connection closed');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();
