// controllers/payment.controller.js

const asyncHandler = require("../utils/asyncHandler");
const { ApiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const paymentService = require("../services/payment.service");
const bookingService = require("../services/booking.service");

const razorpayGateway = require("../services/paymentGateways/razorpay.gateway");
const { BOOKING_STATUS } = require("../constants/bookingStatus");

const PAYMENT_STUB_MODE =
  String(process.env.PAYMENT_STUB_MODE || "false").toLowerCase() === "true";

/**
 * Initiate Payment
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const gateway = String(
    req.body.gateway || req.body.paymentMethod || "RAZORPAY"
  )
    .trim()
    .toUpperCase();

  const booking = await bookingService.getBookingById(req.params.bookingId);

  const isAdmin = req.user.role === "ADMIN";
  const isCustomer = booking.customerId === req.user.id;

  if (!isAdmin && !isCustomer) {
    throw new ApiError(
      403,
      "You are not allowed to initiate payment for this booking"
    );
  }

  if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
    throw new ApiError(
      400,
      `Booking must be in PENDING_PAYMENT status, current: ${booking.status}`
    );
  }

  const payment = await paymentService.initiatePayment(req.params.bookingId, {
    userId: req.user.id,
    gateway,
  });

  let gatewayOrder = null;

  if (payment.gatewayOrderId) {
    gatewayOrder = {
      id: payment.gatewayOrderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      mode: PAYMENT_STUB_MODE ? "STUB" : "LIVE",
    };
  } else {
    if (PAYMENT_STUB_MODE) {
      gatewayOrder = {
        id: `stub_order_${payment.id}_${Date.now()}`,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: "PENDING",
        mode: "STUB",
      };

      payment.gatewayOrderId = gatewayOrder.id;
      payment.status = "PENDING";
      await payment.save();
    } else {
      if (gateway !== "RAZORPAY") {
        throw new ApiError(400, "Unsupported payment gateway");
      }

      gatewayOrder = await razorpayGateway.createOrder({
        bookingId: req.params.bookingId,
        customerId: req.user.id,
        totalAmount: booking.totalAmount,
      });

      payment.gatewayOrderId = gatewayOrder.id;
      payment.status = "PENDING";
      await payment.save();

      gatewayOrder = {
        ...gatewayOrder,
        mode: "LIVE",
      };
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        payment,
        gatewayOrder,
        paymentMode: PAYMENT_STUB_MODE ? "STUB" : "LIVE",
      },
      "Payment initiated successfully"
    )
  );
});

/**
 * Verify Payment
 */
const verifyPayment = asyncHandler(async (req, res) => {
  let { orderId, paymentId, signature } = req.body;

  if (PAYMENT_STUB_MODE) {
    if (!orderId) {
      throw new ApiError(400, "orderId is required");
    }

    paymentId = paymentId || `stub_payment_${Date.now()}`;
    signature = signature || "stub_signature";
  } else {
    if (!orderId || !paymentId || !signature) {
      throw new ApiError(
        400,
        "orderId, paymentId and signature are required"
      );
    }

    const isValid = razorpayGateway.verifySignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValid) {
      throw new ApiError(400, "Invalid payment signature");
    }
  }

  const payment = await paymentService.markPaymentSuccess(
    orderId,
    paymentId,
    signature
  );

  const booking = await bookingService.getBookingById(payment.bookingId);

  const isAdmin = req.user.role === "ADMIN";
  const isCustomer = booking.customerId === req.user.id;

  if (!isAdmin && !isCustomer) {
    throw new ApiError(403, "You are not allowed to verify this payment");
  }

  if (booking.status !== BOOKING_STATUS.PAID) {
    await bookingService.updateBookingStatus(
      payment.bookingId,
      BOOKING_STATUS.PAID,
      PAYMENT_STUB_MODE ? "Stub payment success" : "Payment successful",
      req.user.id
    );
  }

  const updatedBooking = await bookingService.getBookingById(payment.bookingId);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payment,
        booking: updatedBooking,
        paymentMode: PAYMENT_STUB_MODE ? "STUB" : "LIVE",
      },
      "Payment verified successfully"
    )
  );
});

/**
 * Get Payment Details
 */
const getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.paymentId);

  const booking = await bookingService.getBookingById(payment.bookingId);

  const isAdmin = req.user.role === "ADMIN";
  const isCustomer = booking.customerId === req.user.id;
  const isVendor = booking.vendorId === req.user.id;

  if (!isAdmin && !isCustomer && !isVendor) {
    throw new ApiError(403, "You are not allowed to view this payment");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payment,
        paymentMode: PAYMENT_STUB_MODE ? "STUB" : "LIVE",
      },
      "Payment details retrieved"
    )
  );
});

module.exports = {
  initiatePayment,
  verifyPayment,
  getPaymentDetails,
};