/**
 * Delivery Routes
 */

const express = require("express");
const router = express.Router();

const deliveryController = require("../controllers/delivery.controller");
const { auth } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

// Confirm pickup
router.post(
  "/:bookingId/confirm-pickup",
  auth,
  upload.array("photos"),
  deliveryController.confirmPickup
);

// Confirm return / customer approval / auto approval
router.post(
  "/:bookingId/confirm-return",
  auth,
  upload.array("photos"),
  deliveryController.confirmReturn
);

// Get delivery status
router.get(
  "/:bookingId/status",
  auth,
  deliveryController.getDeliveryStatus
);

module.exports = router;
