/**
 * Review Routes
 */

const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const { auth } = require("../middlewares/auth.middleware");

// Create review
router.post(
  "/:bookingId",
  auth,
  reviewController.createReview
);

// Get equipment reviews
router.get(
  "/equipment/:equipmentId",
  reviewController.getEquipmentReviews
);

// Get vendor reviews
router.get(
  "/vendor/:vendorId",
  reviewController.getVendorReviews
);

module.exports = router;
