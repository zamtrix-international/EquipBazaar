/**
 * Payment Validation Schema
 */

const { body, param } = require('express-validator');

const initiatePaymentValidation = [
  body('amount').notEmpty().isFloat({ min: 0 }),
  body('paymentMethod').notEmpty().isIn(['CARD', 'UPI', 'NETBANKING']),
];

const verifyPaymentValidation = [
  body('orderId').notEmpty().isString(),
  body('paymentId').notEmpty().isString(),
  body('signature').notEmpty().isString(),
];

module.exports = {
  initiatePaymentValidation,
  verifyPaymentValidation,
};
