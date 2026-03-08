/**
 * Payment Service
 * Handles payment operations, initiations, and verifications
 */

const Payment = require('../models/Payment');
const PaymentWebhookLog = require('../models/PaymentWebhookLog');
const Booking = require('../models/Booking');
const ApiError = require('../utils/apiError');

/**
 * Initiate payment
 */
const initiatePayment = async (bookingId, paymentData) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return Payment.create({
    bookingId,
    ...paymentData,
    status: 'PENDING',
  });
};

/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
  return payment;
};

/**
 * Verify payment
 */
const verifyPayment = async (paymentId, gatewayResponse) => {
  const payment = await getPaymentById(paymentId);

  if (gatewayResponse.status === 'SUCCESS') {
    payment.status = 'SUCCESS';
    payment.gatewayPaymentId = gatewayResponse.paymentId || gatewayResponse.transactionId || payment.gatewayPaymentId;
    payment.gatewaySignature = gatewayResponse.signature || payment.gatewaySignature;
    payment.paidAt = new Date();
  } else {
    payment.status = 'FAILED';
  }

  await payment.save();
  return payment;
};

/**
 * Log webhook
 */
const logWebhook = async ({ gateway, event, payload, status = 'RECEIVED', idempotencyKey }) => {
  const finalIdempotencyKey =
    idempotencyKey || `${gateway}:${event}:${payload?.id || payload?.event_id || payload?.data?.order?.order_id || Date.now()}`;

  return PaymentWebhookLog.create({
    gateway,
    eventType: event,
    payloadJson: JSON.stringify(payload || {}),
    processed: status === 'PROCESSED',
    processingNote: status,
    idempotencyKey: finalIdempotencyKey,
  });
};

/**
 * Get booking payments
 */
const getBookingPayments = async (bookingId) => {
  return Payment.findAll({
    where: { bookingId },
  });
};

module.exports = {
  initiatePayment,
  getPaymentById,
  verifyPayment,
  logWebhook,
  getBookingPayments,
};
