/**
 * Wallet Validation Schema
 */

const { body, query } = require('express-validator');

const addWalletFundsValidation = [
  body('amount').notEmpty().isFloat({ min: 0 }),
  body('source').notEmpty().isIn(['DEPOSIT', 'REFUND', 'EARNINGS']),
  body('reference').optional().isString().trim(),
];

const getWalletLedgerValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  addWalletFundsValidation,
  getWalletLedgerValidation,
};
