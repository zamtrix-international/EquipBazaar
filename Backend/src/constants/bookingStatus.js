const BOOKING_STATUS = Object.freeze({
  // ✅ Payment flow start
  PENDING_PAYMENT: "PENDING_PAYMENT",

  // ❌ OPTIONAL (remove if not used)
  // REQUESTED: "REQUESTED",

  // ✅ After payment
  PAID: "PAID",

  // ✅ Vendor actions
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",

  // ✅ Work flow
  ON_THE_WAY: "ON_THE_WAY",
  WORK_STARTED: "WORK_STARTED",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",

  // ✅ Edge cases
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
});

module.exports = { BOOKING_STATUS };