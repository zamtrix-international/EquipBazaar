/**
 * Payment Webhook Controller
 */

const crypto = require("crypto");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const paymentService = require("../services/payment.service");
const bookingService = require("../services/booking.service");
const { logger } = require("../utils/logger");
const { BOOKING_STATUS } = require("../constants/bookingStatus");

function verifyRazorpayWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    logger.warn("RAZORPAY_WEBHOOK_SECRET not configured");
    return true;
  }

  if (!signature) return false;

  const generated = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generated),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    logger.warn("Razorpay webhook signature mismatch");
    return res
      .status(400)
      .json({ success: false, message: "Invalid webhook signature" });
  }

  const { event, payload } = req.body;

  await paymentService.logWebhook({
    gateway: "RAZORPAY",
    event,
    payload: req.body,
    status: "RECEIVED",
  });

  try {
    if (
      (event === "payment.authorized" || event === "payment.captured") &&
      payload?.payment?.entity
    ) {
      const entity = payload.payment.entity;

      const gatewayOrderId = entity.order_id;
      const gatewayPaymentId = entity.id;

      const payment = await paymentService.markPaymentSuccess(
        gatewayOrderId,
        gatewayPaymentId,
        signature
      );

      const booking = await bookingService.getBookingById(payment.bookingId);

      if (booking.status === BOOKING_STATUS.ACCEPTED) {
        await bookingService.updateBookingStatus(
          payment.bookingId,
          BOOKING_STATUS.PAID,
          "Payment confirmed via webhook",
          null
        );
      }

      logger.info(`Payment SUCCESS: bookingId=${payment.bookingId}`);

    } else if (event === "payment.failed" && payload?.payment?.entity) {

      const gatewayOrderId = payload.payment.entity.order_id;

      await paymentService.markPaymentFailed(gatewayOrderId);

      logger.warn(`Payment FAILED: orderId=${gatewayOrderId}`);
    }

  } catch (err) {
    logger.error("Webhook processing error:", err);
  }

  res.status(200).json(new ApiResponse(200, null, "Webhook received"));
});

const handleCashfreeWebhook = asyncHandler(async (req, res) => {

  await paymentService.logWebhook({
    gateway: "CASHFREE",
    event: req.body.type,
    payload: req.body,
    status: "RECEIVED",
  });

  const { type, data } = req.body;

  try {
    if (type === "PAYMENT_SUCCESS") {

      const gatewayOrderId = data?.order?.orderId;
      const gatewayPaymentId = String(data?.payment?.cfPaymentId);

      const payment = await paymentService.markPaymentSuccess(
        gatewayOrderId,
        gatewayPaymentId,
        ""
      );

      const booking = await bookingService.getBookingById(payment.bookingId);

      if (booking.status === BOOKING_STATUS.ACCEPTED) {
        await bookingService.updateBookingStatus(
          payment.bookingId,
          BOOKING_STATUS.PAID,
          "Payment confirmed via Cashfree webhook",
          null
        );
      }

    } else if (type === "PAYMENT_FAILED") {

      await paymentService.markPaymentFailed(data?.order?.orderId);

      logger.warn(
        `Cashfree payment FAILED: orderId=${data?.order?.orderId}`
      );
    }

  } catch (err) {
    logger.error("Cashfree webhook error:", err);
  }

  res.status(200).json(new ApiResponse(200, null, "Webhook received"));
});

module.exports = {
  handleRazorpayWebhook,
  handleCashfreeWebhook,
};