/**
 * Commission Routes (Global Commission System)
 */

const express = require("express");
const router = express.Router();

const commissionController = require("../controllers/commission.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

/**
 * Get global commission rule
 * GET /api/commission
 */
router.get(
  "/",
  auth,
  commissionController.getCommissionRule
);

/**
 * Update global commission rule (admin only)
 * PUT /api/commission
 */
router.put(
  "/",
  auth,
  rbac("ADMIN"),
  commissionController.updateCommissionRule
);

/**
 * Calculate commission for booking
 * POST /api/commission/:bookingId/calculate
 */
router.post(
  "/:bookingId/calculate",
  auth,
  commissionController.calculateCommission
);

module.exports = router;