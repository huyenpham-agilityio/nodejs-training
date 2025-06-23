const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const logger = require("./logger.js");

module.exports = (app) => {
  app.set("port", 3001);
  app.set("json spaces", 4);
  app.use(
    morgan("common", {
      stream: {
        write: (message) => logger.info(message),
      },
    })
  );
  app.use(helmet());
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(compression());
  app.use(bodyParser.json());
  app.use(app.auth.initialize());
  app.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
      delete req.body.id;
    }
    next();
  });
  app.use(express.static("public"));
};
