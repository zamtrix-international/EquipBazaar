/**
 * Delivery Service
 * Handles pickup and delivery confirmation operations
 */

const DeliveryConfirmation = require('../models/DeliveryConfirmation');
const Booking = require('../models/Booking');
const apiError = require('../utils/apiError');

/**
 * Create delivery confirmation
 */
const createDeliveryConfirmation = async (bookingId, confirmationData) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new apiError(404, 'Booking not found');
  }

  return await DeliveryConfirmation.create({
    bookingId,
    ...confirmationData,
  });
};

/**
 * Get delivery confirmation
 */
const getDeliveryConfirmation = async (bookingId) => {
  return await DeliveryConfirmation.findOne({
    where: { bookingId },
  });
};

/**
 * Confirm pickup
 */
const confirmPickup = async (bookingId, pickupData) => {
  const confirmation = await DeliveryConfirmation.findOne({
    where: { bookingId },
  });

  if (!confirmation) {
    return await createDeliveryConfirmation(bookingId, pickupData);
  }

  await confirmation.update({
    pickupDate: pickupData.pickupDate,
    pickupPhotos: pickupData.pickupPhotos,
    pickupNotes: pickupData.pickupNotes,
  });

  return confirmation;
};

/**
 * Confirm return/delivery
 */
const confirmReturn = async (bookingId, returnData) => {
  const confirmation = await DeliveryConfirmation.findOne({
    where: { bookingId },
  });

  if (!confirmation) {
    throw new apiError(404, 'Delivery confirmation not found');
  }

  await confirmation.update({
    returnDate: returnData.returnDate,
    returnPhotos: returnData.returnPhotos,
    returnNotes: returnData.returnNotes,
  });

  return confirmation;
};

module.exports = {
  createDeliveryConfirmation,
  getDeliveryConfirmation,
  confirmPickup,
  confirmReturn,
};
