/**
 * Vendor Validation Schema
 */

const { body, param } = require('express-validator');

const createVendorProfileValidation = [
  body('companyName').notEmpty().isString().trim(),
  body('description').optional().isString().trim(),
  body('phoneNumber').notEmpty().isMobilePhone(),
  body('address').notEmpty().isString().trim(),
  body('city').notEmpty().isString().trim(),
  body('state').notEmpty().isString().trim(),
  body('pincode').notEmpty().isPostalCode('IN'),
];

const updateVendorProfileValidation = [
  body('companyName').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('phoneNumber').optional().isMobilePhone(),
  body('address').optional().isString().trim(),
];

const uploadKycDocumentValidation = [
  body('documentType').notEmpty().isIn(['AADHAAR', 'PAN', 'BUSINESS_LICENSE']),
];

const addBankAccountValidation = [
  body('accountNumber').notEmpty().isString().trim(),
  body('ifscCode').notEmpty().isString().trim().isLength({ min: 11, max: 11 }),
  body('accountHolderName').notEmpty().isString().trim(),
  body('bankName').notEmpty().isString().trim(),
];

module.exports = {
  createVendorProfileValidation,
  updateVendorProfileValidation,
  uploadKycDocumentValidation,
  addBankAccountValidation,
};
