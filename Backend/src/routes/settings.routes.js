/**
 * Settings Routes
 * Admin configuration endpoints
 */

const express = require("express");
const router = express.Router();

const settingsController = require("../controllers/settings.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");
const { validate } = require("../middlewares/validate.middleware");

const {
  paymentGatewayQuerySchema,
  upsertPaymentGatewayConfigSchema,
  appSettingsQuerySchema,
  upsertAppSettingSchema,
} = require("../validations/settings.validation");

// Get payment gateway config (admin only)
router.get(
  "/payment-gateway",
  auth,
  rbac("ADMIN"),
  validate(paymentGatewayQuerySchema, "query"),
  settingsController.getPaymentGatewayConfig
);

// Update payment gateway config (admin only)
router.put(
  "/payment-gateway",
  auth,
  rbac("ADMIN"),
  validate(upsertPaymentGatewayConfigSchema, "body"), // ✅ FIX
  settingsController.updatePaymentGatewayConfig
);

// Get app settings (admin only)
router.get(
  "/app",
  auth,
  rbac("ADMIN"),
  validate(appSettingsQuerySchema, "query"),
  settingsController.getAppSettings
);

// Update app settings (admin only)
router.put(
  "/app",
  auth,
  rbac("ADMIN"),
  validate(upsertAppSettingSchema, "body"), // ✅ FIX
  settingsController.updateAppSetting
);

module.exports = router;