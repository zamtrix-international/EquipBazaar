/**
 * Payment Webhook Controller
 * Handles payment gateway webhook events
 */

const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/payment.service');
const bookingService = require('../services/booking.service');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Handle Razorpay webhook
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  try {
    // Log webhook for audit
    await paymentService.logWebhook({
      gateway: 'RAZORPAY',
      event: req.body.event,
      payload: req.body,
      status: 'RECEIVED',
    });

    const { event, payload } = req.body;

    if (event === 'payment.authorized') {
      // Handle successful payment
      const paymentId = payload.payment.entity.id;
      // TODO: Update payment status and booking
    } else if (event === 'payment.failed') {
      // Handle failed payment
      logger.warn(`Payment failed: ${payload.payment.entity.id}`);
    }

    res.status(200).json(new apiResponse(200, null, 'Webhook processed'));
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json(new apiResponse(500, null, 'Webhook processing failed'));
  }
});

/**
 * Handle Cashfree webhook
 */
const handleCashfreeWebhook = asyncHandler(async (req, res) => {
  try {
    await paymentService.logWebhook({
      gateway: 'CASHFREE',
      event: req.body.type,
      payload: req.body,
      status: 'RECEIVED',
    });

    const { type, data } = req.body;

    if (type === 'PAYMENT_SUCCESS') {
      // Handle successful payment
    } else if (type === 'PAYMENT_FAILED') {
      // Handle failed payment
      logger.warn(`Payment failed: ${data.orderId}`);
    }

    res.status(200).json(new apiResponse(200, null, 'Webhook processed'));
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json(new apiResponse(500, null, 'Webhook processing failed'));
  }
});

module.exports = {
  handleRazorpayWebhook,
  handleCashfreeWebhook,
};
