/**
 * Equipment Validation Schema
 */

const { body, query, param } = require('express-validator');

const equipmentTypeValues = ['TRACTOR', 'JCB', 'CRANE', 'DUMPER'];

const createEquipmentValidation = [
  body('name')
    .optional()
    .isString()
    .trim(),

  body('description')
    .optional()
    .isString()
    .trim(),

  body('category')
    .optional()
    .isString()
    .trim(),

  body('dailyRate')
    .optional()
    .isFloat({ min: 0 }),

  body('type')
    .optional()
    .isIn(equipmentTypeValues)
    .withMessage('type must be one of TRACTOR, JCB, CRANE, DUMPER'),

  body('title')
    .optional()
    .isString()
    .trim(),

  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }),

  body('capacityLabel')
    .optional()
    .isString()
    .trim(),

  body('kmRate')
    .optional()
    .isFloat({ min: 0 }),

  body('locationText')
    .optional()
    .isString()
    .trim(),

  body('city')
    .optional()
    .isString()
    .trim(),

  body('minimumHours')
    .optional()
    .isFloat({ min: 0.5 }),

  body().custom((value) => {
    const hasTypeOrCategory = Boolean(value.type || value.category);
    const hasTitleOrName = Boolean(value.title || value.name);
    const hasHourlyOrDailyRate =
      value.hourlyRate !== undefined || value.dailyRate !== undefined;

    if (!hasTypeOrCategory) {
      throw new Error('Either type or category is required');
    }

    if (!hasTitleOrName) {
      throw new Error('Either title or name is required');
    }

    if (!hasHourlyOrDailyRate) {
      throw new Error('Either hourlyRate or dailyRate is required');
    }

    return true;
  }),
];

const updateEquipmentValidation = [
  body('name')
    .optional()
    .isString()
    .trim(),

  body('description')
    .optional()
    .isString()
    .trim(),

  body('category')
    .optional()
    .isString()
    .trim(),

  body('dailyRate')
    .optional()
    .isFloat({ min: 0 }),

  body('type')
    .optional()
    .isIn(equipmentTypeValues),

  body('title')
    .optional()
    .isString()
    .trim(),

  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }),

  body('capacityLabel')
    .optional()
    .isString()
    .trim(),

  body('kmRate')
    .optional()
    .isFloat({ min: 0 }),

  body('locationText')
    .optional()
    .isString()
    .trim(),

  body('city')
    .optional()
    .isString()
    .trim(),

  body('minimumHours')
    .optional()
    .isFloat({ min: 0.5 }),

  body('isActive')
    .optional()
    .isBoolean(),
];

const getEquipmentValidation = [
  param('equipmentId')
    .optional()
    .isInt({ min: 1 }),

  query('page')
    .optional()
    .isInt({ min: 1 }),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
];

module.exports = {
  createEquipmentValidation,
  updateEquipmentValidation,
  getEquipmentValidation,
};