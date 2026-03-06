/**
 * Commission Service
 * Manages commission rules and calculations
 */

const CommissionRule = require('../models/CommissionRule');
const Booking = require('../models/Booking');
const apiError = require('../utils/apiError');

/**
 * Get commission rule
 */
const getCommissionRule = async (vendorId) => {
  return await CommissionRule.findOne({
    where: { vendorId },
  });
};

/**
 * Create or update commission rule
 */
const upsertCommissionRule = async (vendorId, ruleData) => {
  const [rule] = await CommissionRule.findOrCreate({
    where: { vendorId },
    defaults: ruleData,
  });

  if (rule) {
    await rule.update(ruleData);
  }

  return rule;
};

/**
 * Calculate commission for booking
 */
const calculateCommission = async (bookingId) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new apiError(404, 'Booking not found');
  }

  const rule = await getCommissionRule(booking.vendorId);
  const commissionRate = rule ? rule.commissionRate : 0.1; // 10% default

  const commission = booking.totalAmount * commissionRate;

  return {
    bookingId,
    vendorId: booking.vendorId,
    commission,
    commissionRate: commissionRate * 100,
    bookingAmount: booking.totalAmount,
  };
};

/**
 * Get all commission rules
 */
const getAllCommissionRules = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await CommissionRule.findAndCountAll({
    offset,
    limit,
  });
};

module.exports = {
  getCommissionRule,
  upsertCommissionRule,
  calculateCommission,
  getAllCommissionRules,
};
