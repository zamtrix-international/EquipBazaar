/**
 * Wallet Validation Schema
 */

const { body, query } = require('express-validator');

const addWalletFundsValidation = [
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .isFloat({ min: 0.01 }),

  body('refType')
    .optional()
    .isIn(['BOOKING', 'PAYOUT', 'ADJUSTMENT', 'PENALTY'])
    .withMessage('Invalid refType'),

  body('source')
    .optional()
    .isIn(['BOOKING', 'PAYOUT', 'ADJUSTMENT', 'PENALTY'])
    .withMessage('Invalid source'),

  body('refId')
    .optional()
    .isInt({ min: 1 }),

  body('reference')
    .optional()
    .isString()
    .trim(),

  body('description')
    .optional()
    .isString()
    .trim(),
];

const getWalletLedgerValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),

  query('vendorId')
    .optional()
    .isInt({ min: 1 }),
];

module.exports = {
  addWalletFundsValidation,
  getWalletLedgerValidation,
};