/**
 * Booking Controller
 * Handles booking creation and management
 */

const asyncHandler = require('../utils/asyncHandler');
const bookingService = require('../services/booking.service');
const bookingStatusService = require('../services/bookingStatus.service');
const bookingPricingService = require('../services/bookingPricing.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Create booking
 */
const createBooking = asyncHandler(async (req, res) => {
  const pricing = await bookingPricingService.calculateBookingPrice(
    req.body.equipmentId,
    req.body.days,
    req.body.vendorId
  );

  const bookingData = {
    ...req.body,
    customerId: req.user.id,
    totalAmount: pricing.totalAmount,
    status: 'PENDING',
  };

  const booking = await bookingService.createBooking(bookingData);
  res.status(201).json(new apiResponse(201, booking, 'Booking created'));
});

/**
 * Get booking
 */
const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  res.status(200).json(new apiResponse(200, booking, 'Booking retrieved'));
});

/**
 * Get user bookings
 */
const getUserBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await bookingService.getUserBookings(req.user.id, req.user.role, page, limit);
  res.status(200).json(new apiResponse(200, result, 'User bookings retrieved'));
});

/**
 * Update booking status
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { newStatus, reason } = req.body;

  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!bookingStatusService.isValidTransition(booking.status, newStatus)) {
    return res.status(400).json(new apiResponse(400, null, 'Invalid status transition'));
  }

  const updated = await bookingService.updateBookingStatus(
    req.params.bookingId,
    newStatus,
    reason
  );

  res.status(200).json(new apiResponse(200, updated, 'Booking status updated'));
});

module.exports = {
  createBooking,
  getBooking,
  getUserBookings,
  updateBookingStatus,
};
