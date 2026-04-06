/**
 * Vendor Validation Schema (FINAL FIXED)
 */

const { body, param } = require('express-validator');

/**
 * Create Vendor Profile
 */
const createVendorProfileValidation = [
  body('businessName')
    .notEmpty().withMessage('businessName is required')
    .isString().trim(),

  body('ownerName')
    .notEmpty().withMessage('ownerName is required')
    .isString().trim(),

  body('address')
    .optional()
    .isString().trim(),

  body('city')
    .optional()
    .isString().trim(),
];

/**
 * Update Vendor Profile
 */
const updateVendorProfileValidation = [
  body('businessName')
    .optional()
    .isString().trim(),

  body('ownerName')
    .optional()
    .isString().trim(),

  body('address')
    .optional()
    .isString().trim(),

  body('city')
    .optional()
    .isString().trim(),
];

/**
 * Upload KYC Document
 */
const uploadKycDocumentValidation = [
  body('docType')
    .notEmpty().withMessage('docType is required')
    .isIn(['AADHAAR', 'PAN', 'DL', 'RC', 'OTHER'])
    .withMessage('Invalid document type'),

  body('docNumber')
    .optional()
    .isString()
    .trim(),
];

/**
 * Add Bank Account
 */
const addBankAccountValidation = [
  body('accountHolderName')
    .notEmpty().withMessage('accountHolderName is required')
    .isString().trim(),

  body('accountNumber')
    .notEmpty().withMessage('accountNumber is required')
    .isString().trim(),

  body('ifsc')
    .notEmpty().withMessage('ifsc is required')
    .isString()
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('Invalid IFSC code'),

  body('bankName')
    .optional()
    .isString()
    .trim(),

  body('upiId')
    .optional()
    .isString()
    .trim(),
];

/**
 * Update My Bank Account
 * At least one updatable field should be sent from frontend
 */
const updateMyBankAccountValidation = [
  param('bankAccountId')
    .notEmpty().withMessage('bankAccountId is required')
    .isInt({ min: 1 }).withMessage('Invalid bankAccountId'),

  body()
    .custom((value) => {
      const allowedFields = [
        'accountHolderName',
        'accountNumber',
        'ifsc',
        'bankName',
        'upiId',
      ];

      const hasAtLeastOneField = allowedFields.some(
        (field) => value[field] !== undefined
      );

      if (!hasAtLeastOneField) {
        throw new Error('At least one bank account field is required');
      }

      return true;
    }),

  body('accountHolderName')
    .optional()
    .isString().trim(),

  body('accountNumber')
    .optional()
    .isString().trim(),

  body('ifsc')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('Invalid IFSC code'),

  body('bankName')
    .optional()
    .isString()
    .trim(),

  body('upiId')
    .optional()
    .isString()
    .trim(),
];

module.exports = {
  createVendorProfileValidation,
  updateVendorProfileValidation,
  uploadKycDocumentValidation,
  addBankAccountValidation,
  updateMyBankAccountValidation,
};