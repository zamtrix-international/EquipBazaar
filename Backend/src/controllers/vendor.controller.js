/**
 * Vendor Controller
 * Handles vendor profile and KYC operations
 */

const { asyncHandler } = require("../utils/asyncHandler");
const vendorService = require("../services/vendor.service");
const { apiResponse } = require("../utils/apiResponse");

/**
 * Create vendor profile
 */
const createVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.createVendorProfile(req.user.id, req.body);

  return apiResponse(res, {
    status: 201,
    message: "Vendor profile created",
    data: vendor,
  });
});

/**
 * Get vendor profile
 */
const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorProfile(req.params.vendorId);

  return apiResponse(res, {
    status: 200,
    message: "Vendor profile retrieved",
    data: vendor,
  });
});

/**
 * Get my vendor profile
 */
const getMyVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getMyVendorProfile(req.user.id);

  return apiResponse(res, {
    status: 200,
    message: "My vendor profile retrieved",
    data: vendor,
  });
});

/**
 * Update vendor profile
 */
const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.updateVendorProfile(
    req.params.vendorId,
    req.body
  );

  return apiResponse(res, {
    status: 200,
    message: "Vendor profile updated",
    data: vendor,
  });
});

/**
 * Upload KYC document
 */
const uploadKycDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return apiResponse(res, {
      status: 400,
      success: false,
      message: "No file uploaded",
      data: null,
    });
  }

  const kycDocument = await vendorService.uploadKycDocument(req.params.vendorId, {
    docType: req.body.docType,
    docNumber: req.body.docNumber || null,
    fileUrl: req.file.path,
  });

  return apiResponse(res, {
    status: 201,
    message: "KYC document uploaded",
    data: kycDocument,
  });
});

/**
 * Add bank account
 */
const addBankAccount = asyncHandler(async (req, res) => {
  const bankAccount = await vendorService.addBankAccount(
    req.params.vendorId,
    req.body
  );

  return apiResponse(res, {
    status: 201,
    message: "Bank account added",
    data: bankAccount,
  });
});

/**
 * Get my bank accounts
 */
const getMyBankAccounts = asyncHandler(async (req, res) => {
  const bankAccounts = await vendorService.getMyBankAccounts(req.user.id);

  return apiResponse(res, {
    status: 200,
    message: "My bank accounts retrieved",
    data: bankAccounts,
  });
});

/**
 * Update my bank account
 */
const updateMyBankAccount = asyncHandler(async (req, res) => {
  const bankAccount = await vendorService.updateMyBankAccount(
    req.user.id,
    req.params.bankAccountId,
    req.body
  );

  return apiResponse(res, {
    status: 200,
    message: "My bank account updated",
    data: bankAccount,
  });
});

module.exports = {
  createVendorProfile,
  getVendorProfile,
  getMyVendorProfile,
  updateVendorProfile,
  uploadKycDocument,
  addBankAccount,
  getMyBankAccounts,
  updateMyBankAccount,
};