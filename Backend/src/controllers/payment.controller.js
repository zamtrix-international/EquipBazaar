/**
 * Payment Controller
 * Handles payment operations and initiations
 */

const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/payment.service');
const razorpayGateway = require('../services/paymentGateways/razorpay.gateway');
const apiResponse = require('../utils/apiResponse');

/**
 * Initiate payment
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.initiatePayment(req.params.bookingId, {
    ...req.body,
    userId: req.user.id,
  });

  // Create order in payment gateway
  const gatewayOrder = await razorpayGateway.createOrder({
    bookingId: req.params.bookingId,
    customerId: req.user.id,
    totalAmount: req.body.amount,
  });

  payment.gatewayOrderId = gatewayOrder.id;
  await payment.save();

  res.status(201).json(
    new apiResponse(201, { payment, gatewayOrder }, 'Payment initiated')
  );
});

/**
 * Verify payment
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const isValid = razorpayGateway.verifySignature(
    req.body.orderId,
    req.body.paymentId,
    req.body.signature
  );

  if (!isValid) {
    return res.status(400).json(new apiResponse(400, null, 'Invalid payment signature'));
  }

  const payment = await paymentService.verifyPayment(req.params.paymentId, req.body);
  res.status(200).json(new apiResponse(200, payment, 'Payment verified'));
});

/**
 * Get payment details
 */
const getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.paymentId);
  res.status(200).json(new apiResponse(200, payment, 'Payment details retrieved'));
});

module.exports = {
  initiatePayment,
  verifyPayment,
  getPaymentDetails,
};
