/**
 * Equipment Validation Schema
 */

const { body, param, query } = require('express-validator');

const createEquipmentValidation = [
  body('name').notEmpty().isString().trim(),
  body('description').notEmpty().isString().trim(),
  body('category').notEmpty().isString().trim(),
  body('dailyRate').notEmpty().isFloat({ min: 0 }),
  body('quantity').notEmpty().isInt({ min: 1 }),
  body('condition').notEmpty().isIn(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
];

const updateEquipmentValidation = [
  body('name').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('dailyRate').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
];

const getEquipmentValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  createEquipmentValidation,
  updateEquipmentValidation,
  getEquipmentValidation,
};
