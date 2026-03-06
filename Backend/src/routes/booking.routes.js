/**
 * Booking Routes
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Create booking
router.post('/', auth, rbac(['CUSTOMER']), bookingController.createBooking);

// Get booking
router.get('/:bookingId', auth, bookingController.getBooking);

// Get user bookings
router.get('/', auth, bookingController.getUserBookings);

// Update booking status
router.patch('/:bookingId/status', auth, bookingController.updateBookingStatus);

module.exports = router;
