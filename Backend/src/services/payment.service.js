const Payment = require("../models/Payment");
const PaymentWebhookLog = require("../models/PaymentWebhookLog");
const Booking = require("../models/Booking");

const { ApiError } = require("../utils/apiError");
const { makeIdempotencyKey } = require("../utils/idempotency");
const { BOOKING_STATUS } = require("../constants/bookingStatus");

const normalizeGateway = (gateway) => {
  return String(gateway || "RAZORPAY").trim().toUpperCase();
};

const normalizeAmount = (amount) => {
  const parsed = Number(amount);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  return Number(parsed.toFixed(2));
};

/**
 * Initiate Payment
 */
const initiatePayment = async (bookingId, paymentData) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // ✅ ONLY allow when pending payment
  if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
    throw new ApiError(
      400,
      `Booking must be in PENDING_PAYMENT status, current: ${booking.status}`
    );
  }

  const gateway = normalizeGateway(paymentData.gateway);
  const amount = normalizeAmount(booking.totalAmount);

  const idempotencyKey = makeIdempotencyKey(
    `pay-${bookingId}-${paymentData.userId}-${gateway}`
  );

  // ✅ Prevent duplicate payment creation
  const existing = await Payment.findOne({ where: { idempotencyKey } });

  if (existing) {
    return existing;
  }

  return await Payment.create({
    bookingId,
    gateway,
    amount,
    currency: "INR",
    status: "CREATED",
    idempotencyKey,
  });
};

/**
 * Get Payment by ID
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return payment;
};

/**
 * Get Payment by Razorpay Order ID
 */
const getPaymentByGatewayOrderId = async (gatewayOrderId) => {
  const payment = await Payment.findOne({
    where: { gatewayOrderId },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found for this order");
  }

  return payment;
};

/**
 * Mark Payment Success
 */
const markPaymentSuccess = async (
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature
) => {
  const payment = await Payment.findOne({
    where: { gatewayOrderId },
  });

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  // ✅ Already processed
  if (payment.status === "SUCCESS") {
    return payment;
  }

  payment.status = "SUCCESS";
  payment.gatewayPaymentId =
    gatewayPaymentId || payment.gatewayPaymentId;
  payment.gatewaySignature =
    gatewaySignature || payment.gatewaySignature;
  payment.paidAt = payment.paidAt || new Date();

  await payment.save();

  return payment;
};

/**
 * Mark Payment Failed
 */
const markPaymentFailed = async (gatewayOrderId) => {
  const payment = await Payment.findOne({
    where: { gatewayOrderId },
  });

  if (!payment) return null;

  if (payment.status === "SUCCESS") return payment;

  payment.status = "FAILED";
  await payment.save();

  return payment;
};

/**
 * Log Webhook (future use)
 */
const logWebhook = async (webhookData) => {
  return await PaymentWebhookLog.create(webhookData);
};

/**
 * Get all payments of a booking
 */
const getBookingPayments = async (bookingId) => {
  return await Payment.findAll({
    where: { bookingId },
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  initiatePayment,
  getPaymentById,
  getPaymentByGatewayOrderId,
  markPaymentSuccess,
  markPaymentFailed,
  logWebhook,
  getBookingPayments,
};