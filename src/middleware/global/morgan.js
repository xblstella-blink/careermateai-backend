const morgan = require("morgan");
const config = require("../../utils/config");
const logger = require("../../utils/logger");

module.exports = morgan(config.NODE_ENV !== "dev" ? "combined" : "dev", {
  stream: { write: (msg) => logger.info(msg.trim()) },
});
