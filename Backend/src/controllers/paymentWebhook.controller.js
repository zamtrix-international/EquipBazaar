/**
 * Payment Webhook Controller
 * Handles payment gateway webhook events
 */

const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/payment.service");
const apiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

const isProduction = process.env.NODE_ENV === "production";

const isRazorpaySignatureValid = (rawBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return !isProduction;
  }

  if (!rawBody || !signature) return false;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expected.length !== String(signature).length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)));
};

const isCashfreeSignatureValid = (rawBody, signature) => {
  if (!process.env.CASHFREE_WEBHOOK_SECRET) {
    return !isProduction;
  }

  if (!rawBody || !signature) return false;

  const expected = crypto
    .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("base64");

  if (expected.length !== String(signature).length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)));
};

/**
 * Handle Razorpay webhook
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const { event, payload } = req.body;
  const signature = req.headers["x-razorpay-signature"];
  const webhookEventId = req.headers["x-razorpay-event-id"];
  const idempotencyKey = `razorpay:${webhookEventId || event}:${payload?.payment?.entity?.id || payload?.payment?.entity?.order_id || "unknown"}`;

  if (!isRazorpaySignatureValid(req.rawBody, signature)) {
    logger.warn("Invalid Razorpay webhook signature", { idempotencyKey });
    return res.status(400).json(apiResponse(400, null, "Invalid webhook signature"));
  }

  const logEntry = await paymentService.logWebhook({
    gateway: "RAZORPAY",
    event,
    payload: req.body,
    status: "RECEIVED",
    idempotencyKey,
  });

  if (logEntry.processed) {
    return res.status(200).json(apiResponse(200, null, "Webhook already processed"));
  }

  const paymentEntity = payload?.payment?.entity || {};
  if (event === "payment.captured") {
    await paymentService.markPaymentByGatewayEvent({
      gatewayOrderId: paymentEntity.order_id,
      gatewayPaymentId: paymentEntity.id,
      signature,
      status: "SUCCESS",
      paidAt: new Date(),
    });

    await paymentService.markWebhookProcessed(logEntry.id, "CAPTURED");
  } else if (event === "payment.failed") {
    await paymentService.markPaymentByGatewayEvent({
      gatewayOrderId: paymentEntity.order_id,
      gatewayPaymentId: paymentEntity.id,
      signature,
      status: "FAILED",
    });

    await paymentService.markWebhookProcessed(logEntry.id, "FAILED");
  } else {
    await paymentService.markWebhookProcessed(logEntry.id, `IGNORED:${event}`);
  }

  return res.status(200).json(apiResponse(200, null, "Webhook processed"));
});

/**
 * Handle Cashfree webhook
 */
const handleCashfreeWebhook = asyncHandler(async (req, res) => {
  const { type, data } = req.body;
  const signature = req.headers["x-webhook-signature"];
  const orderId = data?.order?.order_id || data?.order_id;
  const paymentId = data?.payment?.cf_payment_id || data?.cf_payment_id;
  const idempotencyKey = `cashfree:${type}:${paymentId || orderId || "unknown"}`;

  if (!isCashfreeSignatureValid(req.rawBody, signature)) {
    logger.warn("Invalid Cashfree webhook signature", { idempotencyKey });
    return res.status(400).json(apiResponse(400, null, "Invalid webhook signature"));
  }

  const logEntry = await paymentService.logWebhook({
    gateway: "CASHFREE",
    event: type,
    payload: req.body,
    status: "RECEIVED",
    idempotencyKey,
  });

  if (logEntry.processed) {
    return res.status(200).json(apiResponse(200, null, "Webhook already processed"));
  }

  if (type === "PAYMENT_SUCCESS") {
    await paymentService.markPaymentByGatewayEvent({
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      signature,
      status: "SUCCESS",
      paidAt: new Date(),
    });

    await paymentService.markWebhookProcessed(logEntry.id, "SUCCESS");
  } else if (type === "PAYMENT_FAILED") {
    await paymentService.markPaymentByGatewayEvent({
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      signature,
      status: "FAILED",
    });

    await paymentService.markWebhookProcessed(logEntry.id, "FAILED");
  } else {
    await paymentService.markWebhookProcessed(logEntry.id, `IGNORED:${type}`);
  }

  return res.status(200).json(apiResponse(200, null, "Webhook processed"));
});

module.exports = {
  handleRazorpayWebhook,
  handleCashfreeWebhook,
};
