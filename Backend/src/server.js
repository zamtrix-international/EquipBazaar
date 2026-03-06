const http = require("http");
const { loadEnv } = require("./config/env");
const { logger } = require("./utils/logger");
const { sequelize } = require("./config/db");
const app = require("./app");

loadEnv();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

async function start() {
  try {
    // DB connect test
    await sequelize.authenticate();
    logger.info(" MySQL connected (sequelize.authenticate)");

    // Optional: for early development only (later migrations)
    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: true });
      logger.warn("⚠️ sequelize.sync({ alter:true }) enabled (DEV only). Disable in production.");
    }

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Server start failed", { message: err.message, stack: err.stack });
    process.exit(1);
  }
}

function shutdown(signal) {
  logger.warn(`🛑 Received ${signal}. Shutting down...`);
  server.close(async () => {
    try {
      await sequelize.close();
      logger.info("✅ DB connection closed");
      process.exit(0);
    } catch (err) {
      logger.error("❌ Error during shutdown", { message: err.message });
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();