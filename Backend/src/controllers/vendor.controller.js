/**
 * Vendor Controller
 * Handles vendor profile and KYC operations
 */

const asyncHandler = require('../utils/asyncHandler');
const vendorService = require('../services/vendor.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Create vendor profile
 */
const createVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.createVendorProfile(req.user.id, req.body);
  res.status(201).json(new apiResponse(201, vendor, 'Vendor profile created'));
});

/**
 * Get vendor profile
 */
const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorProfile(req.params.vendorId);
  res.status(200).json(new apiResponse(200, vendor, 'Vendor profile retrieved'));
});

/**
 * Update vendor profile
 */
const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.updateVendorProfile(req.params.vendorId, req.body);
  res.status(200).json(new apiResponse(200, vendor, 'Vendor profile updated'));
});

/**
 * Upload KYC document
 */
const uploadKycDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new apiResponse(400, null, 'No file uploaded'));
  }

  const kycDocument = await vendorService.uploadKycDocument(req.params.vendorId, {
    documentType: req.body.documentType,
    fileUrl: req.file.path,
  });

  res.status(201).json(new apiResponse(201, kycDocument, 'KYC document uploaded'));
});

/**
 * Add bank account
 */
const addBankAccount = asyncHandler(async (req, res) => {
  const bankAccount = await vendorService.addBankAccount(req.params.vendorId, req.body);
  res.status(201).json(new apiResponse(201, bankAccount, 'Bank account added'));
});

module.exports = {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  uploadKycDocument,
  addBankAccount,
};
