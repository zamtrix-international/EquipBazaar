const http = require("http");

const { loadEnv } = require("./config/env");
const { sequelize } = require("./config/db");
const { logger } = require("./utils/logger");

const app = require("./app");

const { initPaymentReconcileJob } = require("./jobs/paymentReconcile.job");

loadEnv();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function start() {

  try {

    await sequelize.authenticate();

    logger.info("MySQL connected");

    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: true });
    }

    server.listen(PORT, () => {

      logger.info(`Server running on ${PORT}`);

      /* START JOBS */

      initPaymentReconcileJob();

    });

  } catch (err) {

    logger.error("Server start failed", err);

    process.exit(1);

  }

}

start();