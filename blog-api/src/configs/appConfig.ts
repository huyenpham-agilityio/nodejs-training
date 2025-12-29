import { logger } from './logger';

export const appConfig = {
  database: 'blog-db',
  username: '',
  password: '',
  params: {
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === 'test' ? ':memory:' : 'blog.sqlite',
    define: {
      underscored: true,
    },
    logging:
      process.env.NODE_ENV === 'test'
        ? false
        : (sql: string) => {
            logger.log('info', `[${new Date().toISOString()}] ${sql}`);
          },
  },
  jwtSecret:
    process.env.JWT_SECRET ||
    (() => {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('JWT_SECRET environment variable is required');
      }
      return 'TEST_API';
    })(),
  jwtSession: {
    session: false,
  },
};
