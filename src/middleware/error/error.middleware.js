const config = require("../../utils/config");
const logger = require("../../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Final Error Middleware", { req, error });

  const status = error.status || 500;
  const message = error.message || "Something unexpected happended";

  res.status(status).json({
    error: {
      message,
      ...(config.NODE_ENV === "dev" && { stack: error.stack }),
    },
  });
};

module.exports = errorHandler;
