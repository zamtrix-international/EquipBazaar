/**
 * Vendor Routes
 */
const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendor.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");
const { upload } = require("../middlewares/upload.middleware");

// Create vendor profile
router.post("/", auth, rbac("VENDOR"), vendorController.createVendorProfile);

// Get vendor profile
router.get("/:vendorId", vendorController.getVendorProfile);

// Update vendor profile
router.put(
  "/:vendorId",
  auth,
  rbac("VENDOR"),
  vendorController.updateVendorProfile
);

// Upload KYC document
router.post(
  "/:vendorId/kyc",
  auth,
  rbac("VENDOR"),
  upload.single("document"),
  vendorController.uploadKycDocument
);

// Add bank account
router.post(
  "/:vendorId/bank-account",
  auth,
  rbac("VENDOR"),
  vendorController.addBankAccount
);

module.exports = router;
