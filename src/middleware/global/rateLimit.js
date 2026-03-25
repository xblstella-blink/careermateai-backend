const rateLimit = require("express-rate-limit");
const config = require("../../utils/config");

module.exports = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  skip: () => config.NODE_ENV === "dev",
});
