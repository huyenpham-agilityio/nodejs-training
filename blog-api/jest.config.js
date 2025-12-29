export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts', // Integration tests
    '**/__tests__/**/*.test.ts', // Unit tests in modules
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  maxWorkers: 1,
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts', '!src/**/__tests__/**'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/configs/',
    '<rootDir>/tests/',
    '<rootDir>/src/server.ts',
    '<rootDir>/src/app.ts',
    '<rootDir>/src/constants/',
    '<rootDir>/src/middlewares/',
  ],
};
