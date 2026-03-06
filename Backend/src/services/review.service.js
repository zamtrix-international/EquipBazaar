/**
 * Review Service
 * Manages customer reviews and ratings
 */

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const apiError = require('../utils/apiError');

/**
 * Create review
 */
const createReview = async (customerId, bookingId, reviewData) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new apiError(404, 'Booking not found');
  }

  if (booking.customerId !== customerId) {
    throw new apiError(403, 'Unauthorized to review this booking');
  }

  return await Review.create({
    customerId,
    bookingId,
    vendorId: booking.vendorId,
    equipmentId: booking.equipmentId,
    ...reviewData,
  });
};

/**
 * Get review
 */
const getReview = async (reviewId) => {
  const review = await Review.findByPk(reviewId);
  if (!review) {
    throw new apiError(404, 'Review not found');
  }
  return review;
};

/**
 * Get equipment reviews
 */
const getEquipmentReviews = async (equipmentId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await Review.findAndCountAll({
    where: { equipmentId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get vendor reviews
 */
const getVendorReviews = async (vendorId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await Review.findAndCountAll({
    where: { vendorId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get average rating
 */
const getAverageRating = async (entityId, type = 'equipment') => {
  // TODO: Calculate average rating from reviews
  return 4.5; // Placeholder
};

module.exports = {
  createReview,
  getReview,
  getEquipmentReviews,
  getVendorReviews,
  getAverageRating,
};
