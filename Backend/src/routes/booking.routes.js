const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

// Create booking (customer)
router.post(
  "/",
  auth,
  rbac("CUSTOMER"),
  bookingController.createBooking
);

// Get user's bookings list
router.get(
  "/",
  auth,
  bookingController.getUserBookings
);

// Get booking by id
router.get(
  "/:bookingId",
  auth,
  bookingController.getBooking
);

// Update booking status
router.patch(
  "/:bookingId/status",
  auth,
  rbac("CUSTOMER", "VENDOR", "ADMIN"),
  bookingController.updateBookingStatus
);

module.exports = router;