/**
 * Delivery Controller
 * Handles pickup and delivery confirmations
 */

const asyncHandler = require('../utils/asyncHandler');
const deliveryService = require('../services/delivery.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Confirm pickup
 */
const confirmPickup = asyncHandler(async (req, res) => {
  const confirmation = await deliveryService.confirmPickup(
    req.params.bookingId,
    req.body
  );

  res.status(200).json(new apiResponse(200, confirmation, 'Pickup confirmed'));
});

/**
 * Confirm return
 */
const confirmReturn = asyncHandler(async (req, res) => {
  const confirmation = await deliveryService.confirmReturn(
    req.params.bookingId,
    req.body
  );

  res.status(200).json(new apiResponse(200, confirmation, 'Return confirmed'));
});

/**
 * Get delivery status
 */
const getDeliveryStatus = asyncHandler(async (req, res) => {
  const confirmation = await deliveryService.getDeliveryConfirmation(req.params.bookingId);
  res.status(200).json(new apiResponse(200, confirmation, 'Delivery status retrieved'));
});

module.exports = {
  confirmPickup,
  confirmReturn,
  getDeliveryStatus,
};
