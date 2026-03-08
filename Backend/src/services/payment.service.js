/**
 * Payment Service
 * Handles payment operations, initiations, and verifications
 */

const Payment = require("../models/Payment");
const PaymentWebhookLog = require("../models/PaymentWebhookLog");
const Booking = require("../models/Booking");
const ApiError = require("../utils/apiError");

/**
 * Initiate payment
 */
const initiatePayment = async (bookingId, paymentData) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return Payment.create({
    bookingId,
    ...paymentData,
    status: "PENDING",
  });
};

/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }
  return payment;
};

/**
 * Verify payment
 */
const verifyPayment = async (paymentId, gatewayResponse) => {
  const payment = await getPaymentById(paymentId);

  if (gatewayResponse.status === "SUCCESS") {
    payment.status = "SUCCESS";
    payment.gatewayPaymentId = gatewayResponse.paymentId || gatewayResponse.transactionId || payment.gatewayPaymentId;
    payment.gatewaySignature = gatewayResponse.signature || payment.gatewaySignature;
    payment.paidAt = new Date();

    await Booking.update(
      { status: "PAID" },
      { where: { id: payment.bookingId, status: ["REQUESTED", "ACCEPTED"] } }
    );
  } else {
    payment.status = "FAILED";
  }

  await payment.save();
  return payment;
};

const markPaymentByGatewayEvent = async ({ gatewayOrderId, gatewayPaymentId, status, signature, paidAt }) => {
  let payment = null;

  if (gatewayOrderId) {
    payment = await Payment.findOne({ where: { gatewayOrderId } });
  }

  if (!payment && gatewayPaymentId) {
    payment = await Payment.findOne({ where: { gatewayPaymentId } });
  }

  if (!payment) return null;

  payment.status = status;
  payment.gatewayPaymentId = gatewayPaymentId || payment.gatewayPaymentId;
  payment.gatewaySignature = signature || payment.gatewaySignature;
  payment.paidAt = status === "SUCCESS" ? paidAt || new Date() : payment.paidAt;
  await payment.save();

  if (status === "SUCCESS") {
    await Booking.update(
      { status: "PAID" },
      { where: { id: payment.bookingId, status: ["REQUESTED", "ACCEPTED"] } }
    );
  }

  return payment;
};

/**
 * Log webhook (idempotent)
 */
const logWebhook = async ({ gateway, event, payload, status = "RECEIVED", idempotencyKey }) => {
  const finalIdempotencyKey =
    idempotencyKey || `${gateway}:${event}:${payload?.id || payload?.event_id || payload?.data?.order?.order_id || Date.now()}`;

  const existing = await PaymentWebhookLog.findOne({ where: { idempotencyKey: finalIdempotencyKey } });
  if (existing) return existing;

  return PaymentWebhookLog.create({
    gateway,
    eventType: event,
    payloadJson: JSON.stringify(payload || {}),
    processed: status === "PROCESSED",
    processingNote: status,
    idempotencyKey: finalIdempotencyKey,
  });
};

const markWebhookProcessed = async (logId, note = "PROCESSED") => {
  await PaymentWebhookLog.update(
    { processed: true, processingNote: note },
    { where: { id: logId } }
  );
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
  markPaymentByGatewayEvent,
  logWebhook,
  markWebhookProcessed,
  getBookingPayments,
};
