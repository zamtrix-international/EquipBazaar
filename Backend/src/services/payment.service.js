/**
 * Payment Service
 * Handles payment operations, initiations, and verifications
 */

const Payment = require('../models/Payment');
const PaymentWebhookLog = require('../models/PaymentWebhookLog');
const Booking = require('../models/Booking');
const apiError = require('../utils/apiError');

/**
 * Initiate payment
 */
const initiatePayment = async (bookingId, paymentData) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new apiError(404, 'Booking not found');
  }

  return await Payment.create({
    bookingId,
    ...paymentData,
    status: 'INITIATED',
  });
};

/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    throw new apiError(404, 'Payment not found');
  }
  return payment;
};

/**
 * Verify payment
 */
const verifyPayment = async (paymentId, gatewayResponse) => {
  const payment = await getPaymentById(paymentId);

  // TODO: Validate gateway response signature
  // const isValid = validateGatewaySignature(gatewayResponse);

  if (gatewayResponse.status === 'SUCCESS') {
    payment.status = 'SUCCESS';
    payment.transactionId = gatewayResponse.transactionId;
    await payment.save();
  } else {
    payment.status = 'FAILED';
  }

  return payment;
};

/**
 * Log webhook
 */
const logWebhook = async (webhookData) => {
  return await PaymentWebhookLog.create(webhookData);
};

/**
 * Get booking payments
 */
const getBookingPayments = async (bookingId) => {
  return await Payment.findAll({
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
