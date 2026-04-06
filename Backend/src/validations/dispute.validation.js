/**
 * Dispute Validation Schema
 */

const { body, param } = require('express-validator');

const disputeCategories = [
  'PAYMENT',
  'SERVICE',
  'BEHAVIOR',
  'EQUIPMENT',
  'OTHER',
];

const createDisputeValidation = [
  param('bookingId')
    .notEmpty()
    .withMessage('bookingId is required')
    .isInt({ min: 1 }),

  body('reasonCategory')
    .optional()
    .isIn(disputeCategories)
    .withMessage('Invalid reasonCategory'),

  body('category')
    .optional()
    .isIn(disputeCategories)
    .withMessage('Invalid category'),

  body('description')
    .notEmpty()
    .withMessage('description is required')
    .isString()
    .trim(),

  body().custom((value) => {
    if (!value.reasonCategory && !value.category) {
      throw new Error('Either reasonCategory or category is required');
    }
    return true;
  }),
];

const addDisputeMessageValidation = [
  param('disputeId')
    .notEmpty()
    .withMessage('disputeId is required')
    .isInt({ min: 1 }),

  body('message')
    .notEmpty()
    .withMessage('message is required')
    .isString()
    .trim(),
];

const resolveDisputeValidation = [
  param('disputeId')
    .notEmpty()
    .withMessage('disputeId is required')
    .isInt({ min: 1 }),

  body('resolutionNote')
    .optional()
    .isString()
    .trim(),

  body('resolution')
    .optional()
    .isString()
    .trim(),
];

module.exports = {
  createDisputeValidation,
  addDisputeMessageValidation,
  resolveDisputeValidation,
};