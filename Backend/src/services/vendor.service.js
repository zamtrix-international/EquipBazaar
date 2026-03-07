/**
 * Vendor Service
 * Handles vendor management, KYC, and account operations
 */
const VendorProfile = require("../models/VendorProfile");
const VendorKycDocument = require("../models/VendorKycDocument");
const VendorBankAccount = require("../models/VendorBankAccount");
const { ApiError } = require("../utils/apiError");

/**
 * Create vendor profile
 */
const createVendorProfile = async (userId, vendorData) => {
  const vendor = await VendorProfile.create({
    userId,
    ...vendorData,
  });

  return vendor;
};

/**
 * Get vendor profile
 */
const getVendorProfile = async (vendorId) => {
  const vendor = await VendorProfile.findByPk(vendorId, {
    include: [
      {
        model: VendorKycDocument,
        as: "kycDocuments",
      },
      {
        model: VendorBankAccount,
        as: "bankAccounts",
      },
    ],
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return vendor;
};

/**
 * Update vendor profile
 */
const updateVendorProfile = async (vendorId, updateData) => {
  const vendor = await getVendorProfile(vendorId);
  await vendor.update(updateData);
  return vendor;
};

/**
 * Upload KYC document
 */
const uploadKycDocument = async (vendorId, documentData) => {
  await getVendorProfile(vendorId);

  return VendorKycDocument.create({
    vendorId,
    ...documentData,
  });
};

/**
 * Add bank account
 */
const addBankAccount = async (vendorId, bankData) => {
  await getVendorProfile(vendorId);

  return VendorBankAccount.create({
    vendorId,
    ...bankData,
  });
};

module.exports = {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  uploadKycDocument,
  addBankAccount,
};
