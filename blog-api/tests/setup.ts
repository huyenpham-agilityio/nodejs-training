// Jest setup file for test environment

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Increase timeout for database operations
jest.setTimeout(10000);

// Initialize associations by importing the file
import '../src/configs/associations';
