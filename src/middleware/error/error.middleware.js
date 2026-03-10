const config = require("../../utils/config");
const logger = require("../../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Final Error Middleware", { req, err });

  const status = err.status || 500;
  const message = err.message || "Something unexpected happended";

  res.status(status).json({
    error: {
      message,
      ...(config.NODE_ENV === "dev" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
