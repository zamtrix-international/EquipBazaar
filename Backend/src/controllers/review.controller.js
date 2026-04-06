/**
 * Review Controller
 * Handles customer reviews and ratings
 */

const asyncHandler = require('../utils/asyncHandler');
const reviewService = require('../services/review.service');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Create review
 */
const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user.id,
    req.params.bookingId,
    req.body
  );

  res
    .status(201)
    .json(new ApiResponse(201, review, 'Review created'));
});

/**
 * Get equipment reviews
 */
const getEquipmentReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await reviewService.getEquipmentReviews(
    req.params.equipmentId,
    Number(page),
    Number(limit)
  );

  res
    .status(200)
    .json(new ApiResponse(200, reviews, 'Equipment reviews retrieved'));
});

/**
 * Get vendor reviews
 */
const getVendorReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await reviewService.getVendorReviews(
    req.params.vendorId,
    Number(page),
    Number(limit)
  );

  res
    .status(200)
    .json(new ApiResponse(200, reviews, 'Vendor reviews retrieved'));
});

module.exports = {
  createReview,
  getEquipmentReviews,
  getVendorReviews,
};