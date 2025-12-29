import fs from 'fs';
import winston from 'winston';

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: `${logDir}/app.log`,
      maxsize: 1000000,
      maxFiles: 10,
    }),
  ],
});
