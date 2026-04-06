/**
 * Delivery Controller
 * Handles pickup and delivery confirmations
 */

const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiError');
const { ApiResponse } = require('../utils/apiResponse');
const deliveryService = require('../services/delivery.service');
const Booking = require('../models/Booking');
const VendorProfile = require('../models/VendorProfile');
const { BOOKING_STATUS } = require('../constants/bookingStatus');

/**
 * Confirm pickup
 */
const confirmPickup = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'VENDOR') {
    throw new ApiError(403, 'Only vendors can confirm pickup');
  }

  const bookingId = req.params.bookingId;
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const vendorProfile = await VendorProfile.findOne({
    where: { userId: req.user.id },
  });

  if (!vendorProfile || booking.vendorId !== vendorProfile.id) {
    throw new ApiError(403, 'You are not authorized to confirm pickup for this booking');
  }

  if (booking.status !== BOOKING_STATUS.DELIVERED) {
    throw new ApiError(
      400,
      'Pickup confirmation is only allowed after the booking has been delivered'
    );
  }

  const payload = {
    ...req.body,
    changedByUserId: req.user?.id || null,
  };

  const confirmation = await deliveryService.confirmPickup(bookingId, payload);

  res
    .status(200)
    .json(new ApiResponse(200, confirmation, 'Pickup confirmed'));
});

/**
 * Confirm return
 */
const confirmReturn = asyncHandler(async (req, res) => {
  const bookingId = req.params.bookingId;
  
  // Check if booking exists and user has permission
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  
  // Only customer who created the booking can approve return
  if (booking.customerId !== req.user?.id) {
    throw new ApiError(403, 'You are not authorized to approve this delivery');
  }

  const payload = {
    ...req.body,
    changedByUserId: req.user?.id || null,
  };

  const confirmation = await deliveryService.confirmReturn(
    bookingId,
    payload
  );

  res
    .status(200)
    .json(new ApiResponse(200, confirmation, 'Return confirmed'));
});

/**
 * Get delivery status
 */
const getDeliveryStatus = asyncHandler(async (req, res) => {
  const confirmation = await deliveryService.getDeliveryConfirmation(
    req.params.bookingId
  );

  res
    .status(200)
    .json(new ApiResponse(200, confirmation, 'Delivery status retrieved'));
});

module.exports = {
  confirmPickup,
  confirmReturn,
  getDeliveryStatus,
};