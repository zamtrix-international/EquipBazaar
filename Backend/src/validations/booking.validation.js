/**
 * Booking Validation Schema
 */

const { body, param, query } = require('express-validator');

const createBookingValidation = [
  body('equipmentId').notEmpty().isInt(),
  body('vendorId').notEmpty().isInt(),
  body('startDate').notEmpty().isISO8601(),
  body('endDate').notEmpty().isISO8601(),
  body('days').notEmpty().isInt({ min: 1 }),
];

const updateBookingStatusValidation = [
  body('newStatus').notEmpty().isIn([
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'PICKUP_SCHEDULED',
    'PICKED_UP',
    'DELIVERED',
    'RETURNED',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ]),
  body('reason').optional().isString().trim(),
];

const getBookingsValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  createBookingValidation,
  updateBookingStatusValidation,
  getBookingsValidation,
};
