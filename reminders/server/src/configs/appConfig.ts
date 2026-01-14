export const appConfig = {
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || '8080'}`,
};

export default appConfig;
