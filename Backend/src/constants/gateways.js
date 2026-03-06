const PAYMENT_GATEWAYS = Object.freeze({
  RAZORPAY: "RAZORPAY",
  CASHFREE: "CASHFREE",
});

const GATEWAY_MODE = Object.freeze({
  TEST: "TEST",
  LIVE: "LIVE",
});

module.exports = { PAYMENT_GATEWAYS, GATEWAY_MODE };