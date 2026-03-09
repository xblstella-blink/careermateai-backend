const app = require("./app");
const config = require("./utils/config");
const connectDB = require("./utils/db");
const logger = require("./utils/logger");

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", { err });
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { err });
});

const start = async () => {
  await connectDB();

  app.listen(config.PORT, () => {
    logger.info(`[${config.NODE_ENV}] Server listening on port ${config.PORT}`);
  });
};

start();
