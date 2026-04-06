/**
 * Review Validation Schema
 */

const { body, query } = require('express-validator');

const createReviewValidation = [
  body('rating').notEmpty().isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().trim(),
];

const getReviewsValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  createReviewValidation,
  getReviewsValidation,
};