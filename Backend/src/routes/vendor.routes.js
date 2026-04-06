/**
 * Vendor Routes
 */

const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { auth } = require('../middlewares/auth.middleware');
const { rbac } = require('../middlewares/rbac.middleware');
const { upload } = require('../middlewares/upload.middleware');

const VendorProfile = require('../models/VendorProfile');
const { ApiError } = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Ownership check middleware — vendor can only modify their own profile
 */
const checkVendorOwnership = asyncHandler(async (req, res, next) => {
  const vendorProfile = await VendorProfile.findByPk(req.params.vendorId);

  if (!vendorProfile) {
    throw new ApiError(404, 'Vendor profile not found');
  }

  if (Number(vendorProfile.userId) !== Number(req.user.id)) {
    throw new ApiError(403, 'You can only modify your own vendor profile');
  }

  req.vendorProfile = vendorProfile;
  next();
});

/**
 * Resolve logged-in vendor's own profile
 * Injects vendorId into req.params so existing controllers/services continue to work
 */
const resolveOwnVendorProfile = asyncHandler(async (req, res, next) => {
  const vendorProfile = await VendorProfile.findOne({
    where: { userId: req.user.id },
  });

  if (!vendorProfile) {
    throw new ApiError(404, 'Vendor profile not found');
  }

  req.vendorProfile = vendorProfile;
  req.params.vendorId = String(vendorProfile.id);
  next();
});

// Create vendor profile
router.post(
  '/',
  auth,
  rbac('VENDOR'),
  vendorController.createVendorProfile
);

// -------------------------
// NEW SELF ENDPOINTS
// -------------------------

// Get my vendor profile (new dedicated endpoint)
router.get(
  '/me/profile',
  auth,
  rbac('VENDOR'),
  vendorController.getMyVendorProfile
);

// Get my bank accounts
router.get(
  '/me/bank-accounts',
  auth,
  rbac('VENDOR'),
  vendorController.getMyBankAccounts
);

// Update my bank account
router.put(
  '/me/bank-account/:bankAccountId',
  auth,
  rbac('VENDOR'),
  vendorController.updateMyBankAccount
);

// -------------------------
// EXISTING SELF ENDPOINTS
// Keep same for old frontend compatibility
// -------------------------

// Get own vendor profile
router.get(
  '/me',
  auth,
  rbac('VENDOR'),
  resolveOwnVendorProfile,
  vendorController.getVendorProfile
);

// Update own vendor profile
router.put(
  '/me',
  auth,
  rbac('VENDOR'),
  resolveOwnVendorProfile,
  vendorController.updateVendorProfile
);

// Upload own KYC document
router.post(
  '/me/kyc',
  auth,
  rbac('VENDOR'),
  resolveOwnVendorProfile,
  upload.single('document'),
  vendorController.uploadKycDocument
);

// Add own bank account
router.post(
  '/me/bank-account',
  auth,
  rbac('VENDOR'),
  resolveOwnVendorProfile,
  vendorController.addBankAccount
);

// -------------------------
// EXISTING PUBLIC / ID-BASED ENDPOINTS
// Keep same for old frontend compatibility
// -------------------------

// Get vendor profile — public
router.get(
  '/:vendorId',
  vendorController.getVendorProfile
);

// Update vendor profile — only own profile
router.put(
  '/:vendorId',
  auth,
  rbac('VENDOR'),
  checkVendorOwnership,
  vendorController.updateVendorProfile
);

// Upload KYC document — only own profile
router.post(
  '/:vendorId/kyc',
  auth,
  rbac('VENDOR'),
  checkVendorOwnership,
  upload.single('document'),
  vendorController.uploadKycDocument
);

// Add bank account — only own profile
router.post(
  '/:vendorId/bank-account',
  auth,
  rbac('VENDOR'),
  checkVendorOwnership,
  vendorController.addBankAccount
);

module.exports = router;