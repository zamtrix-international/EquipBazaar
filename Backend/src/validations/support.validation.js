/**
 * Support Validation Schema
 */

const { body, query } = require('express-validator');

const createSupportTicketValidation = [
  body('subject')
    .notEmpty()
    .withMessage('subject is required')
    .isString()
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('description is required')
    .isString()
    .trim(),

  body('category')
    .optional()
    .isIn(['BOOKING', 'PAYMENT', 'DELIVERY', 'KYC', 'TECH', 'OTHER'])
    .withMessage('Invalid category'),

  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Invalid priority'),
];

const addTicketMessageValidation = [
  body('message')
    .notEmpty()
    .withMessage('message is required')
    .isString()
    .trim(),
];

const getUserTicketsValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  createSupportTicketValidation,
  addTicketMessageValidation,
  getUserTicketsValidation,
};