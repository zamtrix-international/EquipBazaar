/**
 * Payout Routes
 */

const express = require("express");
const router = express.Router();

const payoutController = require("../controllers/payout.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

// Create withdrawal request
router.post(
  "/withdrawal-request",
  auth,
  rbac("VENDOR"),
  payoutController.createWithdrawalRequest
);

// Get withdrawal request
router.get(
  "/withdrawal-request/:requestId",
  auth,
  payoutController.getWithdrawalRequest
);

// Get vendor payouts
router.get(
  "/",
  auth,
  rbac("VENDOR"),
  payoutController.getVendorPayouts
);

// Process withdrawal (admin only)
router.patch(
  "/withdrawal-request/:requestId/process",
  auth,
  rbac("ADMIN"),
  payoutController.processWithdrawal
);

module.exports = router;
