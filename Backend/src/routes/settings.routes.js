/**
 * Settings Routes
 * For gateway configuration and commission rules
 */

const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

/**
 * TODO: Add controllers for:
 * - Payment gateway configuration (Razorpay, Cashfree keys)
 * - App settings management
 * - Commission rules management
 * - System configuration
 */

// Get payment gateway config (admin only)
router.get("/payment-gateway", auth, rbac("ADMIN"), (req, res) => {
  // TODO: Implement
  res.status(200).json({ message: "Payment gateway config" });
});

// Update payment gateway config (admin only)
router.put("/payment-gateway", auth, rbac("ADMIN"), (req, res) => {
  // TODO: Implement
  res.status(200).json({ message: "Payment gateway config updated" });
});

// Get app settings (admin only)
router.get("/app", auth, rbac("ADMIN"), (req, res) => {
  // TODO: Implement
  res.status(200).json({ message: "App settings" });
});

// Update app settings (admin only)
router.put("/app", auth, rbac("ADMIN"), (req, res) => {
  // TODO: Implement
  res.status(200).json({ message: "App settings updated" });
});

module.exports = router;
