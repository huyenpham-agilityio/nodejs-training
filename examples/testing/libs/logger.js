const fs = require("fs");
const winston = require("winston");

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

module.exports = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "info",
      maxsize: 1000000,
      maxFiles: 10,
      colorize: false,
    }),
  ],
});
