const app = require("./app");
const config = require("./utils/config");
const connectDB = require("./utils/db");
const logger = require("./utils/logger");
const { default: mongoose } = require("mongoose");

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", { err });
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { err });
  process.exit(1);
});

const start = async () => {
  await connectDB();

  const server = app.listen(config.PORT, () => {
    logger.info(`[${config.NODE_ENV}] Server listening on port ${config.PORT}`);
  });

  const shutdown = (signal) => {
    server.close(() => {
      logger.info(`${signal} received, shutting down gracefully now`);
      mongoose.connection.close().then(() => {
        logger.info("DB connection closed");
        process.exit(0);
      });
    });
    setTimeout(() => {
      logger.error("Graceful shutdown timeout, forcing exit now");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start();
