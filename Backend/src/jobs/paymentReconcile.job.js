const cron = require("node-cron");
const { logger } = require("../utils/logger");

const Payment = require("../models/Payment");

const reconcilePayments = async () => {

  try {

    logger.info("Starting payment reconciliation job");

    const pendingPayments = await Payment.findAll({
      where: {
        status: ["PENDING", "CREATED"]
      }
    });

    for (const payment of pendingPayments) {

      logger.debug(`Checking payment ${payment.id}`);

      // gateway status check placeholder

    }

    logger.info("Payment reconciliation finished");

  } catch (error) {

    logger.error("Payment reconcile job error", error);

  }
};

const initPaymentReconcileJob = () => {

  cron.schedule("*/10 * * * *", reconcilePayments);

};

module.exports = {
  initPaymentReconcileJob
};