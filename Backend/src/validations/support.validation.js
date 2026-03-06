/**
 * Support Validation Schema
 */

const { body, param, query } = require('express-validator');

const createSupportTicketValidation = [
  body('subject').notEmpty().isString().trim(),
  body('description').notEmpty().isString().trim(),
  body('category').notEmpty().isIn(['BOOKING', 'PAYMENT', 'DELIVERY', 'OTHER']),
];

const addTicketMessageValidation = [
  body('message').notEmpty().isString().trim(),
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
