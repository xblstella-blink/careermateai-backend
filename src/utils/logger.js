const winston = require("winston");
const config = require("./config");

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format((info) => {
      if (info.req) {
        info.req = {
          method: info.req.method,
          url: info.req.url,
        };
      }
      if (info.err) {
        info.err = {
          message: info.err.message,
          stack: info.err.stack,
        };
      }
      return info;
    })(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let log = `[${timestamp}] [${level}]: ${message}`;
      if (Object.keys(meta).length > 0) {
        log += `${JSON.stringify(meta)}`;
      }
      return log;
    }),
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
