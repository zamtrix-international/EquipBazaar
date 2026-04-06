/**
 * Vendor Service
 * Handles vendor management, KYC, and account operations
 */

const VendorProfile = require("../models/VendorProfile");
const VendorKycDocument = require("../models/VendorKycDocument");
const VendorBankAccount = require("../models/VendorBankAccount");
const { ApiError } = require("../utils/apiError");

/**
 * Find vendor profile by logged-in user
 */
const getVendorProfileByUserId = async (userId) => {
  const vendor = await VendorProfile.findOne({
    where: { userId },
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
    throw new ApiError(404, "Vendor profile not found");
  }

  return vendor;
};

/**
 * Create vendor profile
 */
const createVendorProfile = async (userId, vendorData) => {
  const existingVendor = await VendorProfile.findOne({
    where: { userId },
  });

  if (existingVendor) {
    throw new ApiError(400, "Vendor profile already exists");
  }

  const vendor = await VendorProfile.create({
    userId,
    businessName: vendorData.businessName,
    ownerName: vendorData.ownerName,
    address: vendorData.address || null,
    city: vendorData.city || "Meerut",
  });

  return vendor;
};

/**
 * Get vendor profile by vendor id
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
 * Get my vendor profile
 */
const getMyVendorProfile = async (userId) => {
  return await getVendorProfileByUserId(userId);
};

/**
 * Update vendor profile
 */
const updateVendorProfile = async (vendorId, updateData) => {
  const vendor = await getVendorProfile(vendorId);

  await vendor.update({
    businessName: updateData.businessName ?? vendor.businessName,
    ownerName: updateData.ownerName ?? vendor.ownerName,
    address: updateData.address ?? vendor.address,
    city: updateData.city ?? vendor.city,
  });

  return vendor;
};

/**
 * Upload KYC document by vendor id
 */
const uploadKycDocument = async (vendorId, documentData) => {
  await getVendorProfile(vendorId);

  return await VendorKycDocument.create({
    vendorId,
    docType: documentData.docType,
    docNumber: documentData.docNumber || null,
    fileUrl: documentData.fileUrl,
  });
};

/**
 * Upload KYC document for logged-in vendor
 */
const uploadOwnKycDocument = async (userId, documentData) => {
  const vendor = await getVendorProfileByUserId(userId);

  return await VendorKycDocument.create({
    vendorId: vendor.id,
    docType: documentData.docType,
    docNumber: documentData.docNumber || null,
    fileUrl: documentData.fileUrl,
  });
};

/**
 * Add bank account by vendor id
 */
const addBankAccount = async (vendorId, bankData) => {
  await getVendorProfile(vendorId);

  return await VendorBankAccount.create({
    vendorId,
    accountHolderName: bankData.accountHolderName,
    accountNumber: bankData.accountNumber,
    ifsc: bankData.ifsc,
    bankName: bankData.bankName || null,
    upiId: bankData.upiId || null,
  });
};

/**
 * Add bank account for logged-in vendor
 */
const addOwnBankAccount = async (userId, bankData) => {
  const vendor = await getVendorProfileByUserId(userId);

  return await VendorBankAccount.create({
    vendorId: vendor.id,
    accountHolderName: bankData.accountHolderName,
    accountNumber: bankData.accountNumber,
    ifsc: bankData.ifsc,
    bankName: bankData.bankName || null,
    upiId: bankData.upiId || null,
  });
};

/**
 * Get my bank accounts
 */
const getMyBankAccounts = async (userId) => {
  const vendor = await getVendorProfileByUserId(userId);

  return await VendorBankAccount.findAll({
    where: { vendorId: vendor.id },
    order: [["createdAt", "DESC"]],
  });
};

/**
 * Update my bank account
 */
const updateMyBankAccount = async (userId, bankAccountId, updateData) => {
  const vendor = await getVendorProfileByUserId(userId);

  const bankAccount = await VendorBankAccount.findByPk(bankAccountId);

  if (!bankAccount) {
    throw new ApiError(404, "Bank account not found");
  }

  if (Number(bankAccount.vendorId) !== Number(vendor.id)) {
    throw new ApiError(403, "Bank account does not belong to this vendor");
  }

  await bankAccount.update({
    accountHolderName:
      updateData.accountHolderName ?? bankAccount.accountHolderName,
    accountNumber: updateData.accountNumber ?? bankAccount.accountNumber,
    ifsc: updateData.ifsc ?? bankAccount.ifsc,
    bankName: updateData.bankName ?? bankAccount.bankName,
    upiId: updateData.upiId ?? bankAccount.upiId,
  });

  return bankAccount;
};

module.exports = {
  createVendorProfile,
  getVendorProfile,
  getVendorProfileByUserId,
  getMyVendorProfile,
  updateVendorProfile,
  uploadKycDocument,
  uploadOwnKycDocument,
  addBankAccount,
  addOwnBankAccount,
  getMyBankAccounts,
  updateMyBankAccount,
};