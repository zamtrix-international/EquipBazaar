/**
 * Commission Routes
 */

const express = require("express");
const router = express.Router();

const commissionController = require("../controllers/commission.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

// Get commission rule
router.get(
  "/:vendorId",
  auth,
  commissionController.getCommissionRule
);

// Update commission rule (admin only)
router.put(
  "/:vendorId",
  auth,
  rbac("ADMIN"),
  commissionController.updateCommissionRule
);

// Calculate commission for booking
router.post(
  "/:bookingId/calculate",
  auth,
  commissionController.calculateCommission
);

module.exports = router;
