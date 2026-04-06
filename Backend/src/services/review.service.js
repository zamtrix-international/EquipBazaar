/**
 * Review Service
 * Manages customer reviews and ratings
 */

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { ApiError } = require('../utils/apiError');
const { BOOKING_STATUS } = require('../constants/bookingStatus');

const normalizePagination = (page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);

  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
};

/**
 * Create review
 */
const createReview = async (customerId, bookingId, reviewData) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (Number(booking.customerId) !== Number(customerId)) {
    throw new ApiError(403, 'Unauthorized to review this booking');
  }

  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw new ApiError(400, 'Review can only be added after booking is completed');
  }

  const existingReview = await Review.findOne({
    where: { bookingId },
  });

  if (existingReview) {
    throw new ApiError(409, 'Review already exists for this booking');
  }

  const rating = Number(reviewData.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, 'rating must be an integer between 1 and 5');
  }

  const comment =
    reviewData.comment && String(reviewData.comment).trim()
      ? String(reviewData.comment).trim()
      : null;

  return await Review.create({
    customerId,
    bookingId,
    vendorId: booking.vendorId,
    equipmentId: booking.equipmentId,
    rating,
    comment,
  });
};

/**
 * Get review
 */
const getReview = async (reviewId) => {
  const review = await Review.findByPk(reviewId);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  return review;
};

/**
 * Get equipment reviews
 */
const getEquipmentReviews = async (equipmentId, page = 1, limit = 10) => {
  const { offset, limit: safeLimit } = normalizePagination(page, limit);

  return await Review.findAndCountAll({
    where: { equipmentId },
    offset,
    limit: safeLimit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get vendor reviews
 */
const getVendorReviews = async (vendorId, page = 1, limit = 10) => {
  const { offset, limit: safeLimit } = normalizePagination(page, limit);

  return await Review.findAndCountAll({
    where: { vendorId },
    offset,
    limit: safeLimit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get average rating
 */
const getAverageRating = async (entityId, type = 'equipment') => {
  const where =
    type === 'vendor'
      ? { vendorId: entityId }
      : { equipmentId: entityId };

  const reviews = await Review.findAll({
    where,
    attributes: ['rating'],
    raw: true,
  });

  if (!reviews.length) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  const average = total / reviews.length;

  return {
    averageRating: Number(average.toFixed(2)),
    totalReviews: reviews.length,
  };
};

module.exports = {
  createReview,
  getReview,
  getEquipmentReviews,
  getVendorReviews,
  getAverageRating,
};