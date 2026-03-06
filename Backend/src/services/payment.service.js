const crypto = require("crypto");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const PaymentWebhookLog = require("../models/PaymentWebhookLog");

const ApiError = require("../utils/apiError");

const initiatePayment = async (bookingId, paymentData) => {

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const payment = await Payment.create({
    bookingId,
    ...paymentData,
    status: "CREATED"
  });

  return payment;
};


const verifyPayment = async (paymentId, gatewayResponse) => {

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
};

module.exports = {
  initiatePayment,
  verifyPayment,
  logWebhook
};