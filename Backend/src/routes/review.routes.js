/**
 * Review Routes
 */

const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");
const {
  createReviewValidation,
  getReviewsValidation,
} = require("../validations/review.validation");

// Create review
router.post(
  "/:bookingId",
  auth,
  rbac("CUSTOMER"),
  createReviewValidation,
  reviewController.createReview
);

// Get equipment reviews
router.get(
  "/equipment/:equipmentId",
  getReviewsValidation,
  reviewController.getEquipmentReviews
);

// Get vendor reviews
router.get(
  "/vendor/:vendorId",
  getReviewsValidation,
  reviewController.getVendorReviews
);

module.exports = router;