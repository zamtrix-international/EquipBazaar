/**
 * Dispute Validation Schema
 */

const { body, param } = require('express-validator');

const createDisputeValidation = [
  body('title').notEmpty().isString().trim(),
  body('description').notEmpty().isString().trim(),
  body('category').notEmpty().isIn(['QUALITY', 'DAMAGE', 'LATE_RETURN', 'MISSING_ITEMS', 'OTHER']),
];

const resolveDisputeValidation = [
  body('resolution').notEmpty().isString().trim(),
];

module.exports = {
  createDisputeValidation,
  resolveDisputeValidation,
};
