const crypto = require("crypto");

<<<<<<< HEAD
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const PaymentWebhookLog = require("../models/PaymentWebhookLog");

const ApiError = require("../utils/apiError");
=======
const Payment = require('../models/Payment');
const PaymentWebhookLog = require('../models/PaymentWebhookLog');
const Booking = require('../models/Booking');
const ApiError = require('../utils/apiError');
>>>>>>> 8b74ad53ef335469c8c895d0db8e151feed63729

const initiatePayment = async (bookingId, paymentData) => {

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
<<<<<<< HEAD
    throw new ApiError(404, "Booking not found");
  }

  const payment = await Payment.create({
    bookingId,
    ...paymentData,
    status: "CREATED"
=======
    throw new ApiError(404, 'Booking not found');
  }

  return Payment.create({
    bookingId,
    ...paymentData,
    status: 'PENDING',
>>>>>>> 8b74ad53ef335469c8c895d0db8e151feed63729
  });

<<<<<<< HEAD
=======
/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
>>>>>>> 8b74ad53ef335469c8c895d0db8e151feed63729
  return payment;
};


const verifyPayment = async (paymentId, gatewayResponse) => {

<<<<<<< HEAD
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const { orderId, paymentId: gatewayPaymentId, signature } = gatewayResponse;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(orderId + "|" + gatewayPaymentId)
    .digest("hex");

  if (generatedSignature !== signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  payment.status = "SUCCESS";
  payment.transactionId = gatewayPaymentId;

  await payment.save();

  return payment;
};

const logWebhook = async (data) => {
  return await PaymentWebhookLog.create(data);
=======
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
>>>>>>> 8b74ad53ef335469c8c895d0db8e151feed63729
};

module.exports = {
  initiatePayment,
  verifyPayment,
  logWebhook
};