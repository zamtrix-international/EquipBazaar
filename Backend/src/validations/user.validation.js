/**
 * User Validation Schema
 */

const { body, param, query } = require('express-validator');

const updateUserProfileValidation = [
  body('firstName').optional().isString().trim(),
  body('lastName').optional().isString().trim(),
  body('phoneNumber').optional().isString().trim(),
  body('address').optional().isString().trim(),
];

const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  updateUserProfileValidation,
  getUsersValidation,
};
