/**
 * Delivery Service
 * Handles pickup and delivery confirmation operations
 */

const DeliveryConfirmation = require('../models/DeliveryConfirmation');
const Booking = require('../models/Booking');
const { BOOKING_STATUS } = require('../constants/bookingStatus');
const bookingService = require('./booking.service');
const { ApiError } = require('../utils/apiError');

/**
 * Create delivery confirmation
 */
const createDeliveryConfirmation = async (bookingId, confirmationData) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
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
  const confirmation = await DeliveryConfirmation.findOne({
    where: { bookingId },
  });

  if (!confirmation) {
    throw new ApiError(404, 'Delivery confirmation not found');
  }

  return confirmation;
};

/**
 * Confirm pickup
 */
const confirmPickup = async (bookingId, pickupData) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  let confirmation = await DeliveryConfirmation.findOne({
    where: { bookingId },
  });

  if (!confirmation) {
    confirmation = await createDeliveryConfirmation(bookingId, {
      deliveredByVendorUserId:
        pickupData.deliveredByVendorUserId || pickupData.changedByUserId || null,
      proofUrl: pickupData.proofUrl || null,
      pickupDate: pickupData.pickupDate || new Date(),
      pickupPhotos: pickupData.pickupPhotos || null,
      pickupNotes: pickupData.pickupNotes || null,
    });

    return confirmation;
  }

  await confirmation.update({
    deliveredByVendorUserId:
      pickupData.deliveredByVendorUserId ||
      pickupData.changedByUserId ||
      confirmation.deliveredByVendorUserId,
    proofUrl: pickupData.proofUrl || confirmation.proofUrl,
    pickupDate: pickupData.pickupDate || confirmation.pickupDate || new Date(),
    pickupPhotos: pickupData.pickupPhotos || confirmation.pickupPhotos,
    pickupNotes: pickupData.pickupNotes || confirmation.pickupNotes,
  });

  return confirmation;
};

/**
 * Confirm return / delivery completion
 * Rule:
 * - If customerApproved = true OR autoApproved = true
 * - then booking moves to COMPLETED
 * - wallet credit is triggered inside booking.service.js on COMPLETED
 */
const confirmReturn = async (bookingId, returnData) => {
  let confirmation = await DeliveryConfirmation.findOne({
    where: { bookingId },
  });

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // If confirmation doesn't exist, create it
  if (!confirmation) {
    confirmation = await DeliveryConfirmation.create({
      bookingId,
      returnDate: new Date(),
      autoApproved: false,
      customerApproved: false,
    });
  }

  const customerApproved =
    typeof returnData.customerApproved === 'boolean'
      ? returnData.customerApproved
      : confirmation.customerApproved;

  const autoApproved =
    typeof returnData.autoApproved === 'boolean'
      ? returnData.autoApproved
      : confirmation.autoApproved;

  if ((customerApproved === true || autoApproved === true) && !confirmation.pickupDate) {
    throw new ApiError(
      400,
      'Vendor must confirm pickup before the return can be approved'
    );
  }

  if ((customerApproved === true || autoApproved === true) && booking.status !== BOOKING_STATUS.DELIVERED) {
    throw new ApiError(
      400,
      'Return approval can only happen after delivery is complete'
    );
  }

  await confirmation.update({
    returnDate: returnData.returnDate || new Date(),
    returnPhotos: returnData.returnPhotos || confirmation.returnPhotos,
    returnNotes: returnData.returnNotes || confirmation.returnNotes,

    customerApproved,
    customerApprovedAt:
      returnData.customerApproved === true
        ? new Date()
        : confirmation.customerApprovedAt,

    autoApproved,
    autoApprovedAt:
      returnData.autoApproved === true
        ? new Date()
        : confirmation.autoApprovedAt,
  });

  const shouldComplete = customerApproved === true || autoApproved === true;

  if (shouldComplete && booking.status !== BOOKING_STATUS.COMPLETED) {
    await bookingService.updateBookingStatus(
      bookingId,
      BOOKING_STATUS.COMPLETED,
      customerApproved
        ? 'Customer approved delivery'
        : 'Auto approved delivery',
      returnData.changedByUserId || null
    );
  }

  return await getDeliveryConfirmation(bookingId);
};

module.exports = {
  createDeliveryConfirmation,
  getDeliveryConfirmation,
  confirmPickup,
  confirmReturn,
};