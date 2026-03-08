/**
 * Payment Webhook Controller
 * Handles payment gateway webhook events
 */

const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/payment.service');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Handle Razorpay webhook
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const { event, payload } = req.body;

  await paymentService.logWebhook({
    gateway: 'RAZORPAY',
    event,
    payload: req.body,
    status: 'RECEIVED',
    idempotencyKey: `razorpay:${event}:${payload?.payment?.entity?.id || req.headers['x-razorpay-event-id'] || Date.now()}`,
  });

  if (event === 'payment.failed') {
    logger.warn(`Payment failed: ${payload?.payment?.entity?.id || 'unknown'}`);
  }

  return res.status(200).json(apiResponse(200, null, 'Webhook processed'));
});

/**
 * Handle Cashfree webhook
 */
const handleCashfreeWebhook = asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  await paymentService.logWebhook({
    gateway: 'CASHFREE',
    event: type,
    payload: req.body,
    status: 'RECEIVED',
    idempotencyKey: `cashfree:${type}:${data?.payment?.cf_payment_id || data?.order?.order_id || Date.now()}`,
  });

  if (type === 'PAYMENT_FAILED') {
    logger.warn(`Payment failed: ${data?.order?.order_id || 'unknown'}`);
  }

  return res.status(200).json(apiResponse(200, null, 'Webhook processed'));
});

module.exports = {
  handleRazorpayWebhook,
  handleCashfreeWebhook,
};
