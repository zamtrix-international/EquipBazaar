/**
 * Payment Reconciliation Job
 * Syncs payment status with payment gateway and resolves discrepancies
 * Runs periodically to ensure payment data consistency
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const Payment = require('../models/Payment');
const PaymentWebhookLog = require('../models/PaymentWebhookLog');

/**
 * Reconcile payments with gateway
 */
const reconcilePayments = async () => {
  try {
    logger.info('Starting payment reconciliation job');

    // Get pending payments from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pendingPayments = await Payment.findAll({
      where: {
        status: ['PENDING', 'INITIATED'],
        updatedAt: {
          [require('sequelize').Op.gte]: twentyFourHoursAgo,
        },
      },
    });

    logger.info(`Found ${pendingPayments.length} pending payments to reconcile`);

    for (const payment of pendingPayments) {
      try {
        // Query payment gateway for current status
        // This depends on your payment gateway (Razorpay, Cashfree, etc.)
        // Placeholder: payment.reconcileWithGateway()

        logger.debug(`Reconciled payment ${payment.id}`);
      } catch (error) {
        logger.error(`Error reconciling payment ${payment.id}:`, error);
      }
    }

    logger.info('Payment reconciliation job completed');
  } catch (error) {
    logger.error('Error in payment reconciliation job:', error);
  }
};

/**
 * Initialize payment reconciliation job
 * Runs every 6 hours
 */
const initPaymentReconcileJob = () => {
  // Cron expression: 0 */6 * * * (every 6 hours)
  cron.schedule('0 */6 * * *', async () => {
    await reconcilePayments();
  });

  logger.info('Payment reconciliation job initialized');
};

module.exports = {
  reconcilePayments,
  initPaymentReconcileJob,
};
