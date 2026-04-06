/**
 * Commission Service
 * Manages commission rules and calculations
 */

const CommissionRule = require('../models/CommissionRule');
const Booking = require('../models/Booking');
const apiError = require('../utils/apiError');

/**
 * Get global commission rule
 */
const getCommissionRule = async () => {
  return await CommissionRule.findOne({
    where: { scope: 'GLOBAL' },
  });
};

/**
 * Create or update global commission rule
 */
const upsertCommissionRule = async ({ scope, commissionPct }) => {
  const [rule] = await CommissionRule.findOrCreate({
    where: { scope },
    defaults: {
      scope,
      commissionPct,
    },
  });

  await rule.update({
    scope,
    commissionPct,
  });

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

  const rule = await getCommissionRule();
  const commissionPct = rule ? Number(rule.commissionPct) : 10;
  const bookingAmount = Number(booking.totalAmount || 0);
  const commission = (bookingAmount * commissionPct) / 100;

  return {
    bookingId,
    vendorId: booking.vendorId,
    bookingAmount,
    commissionPct,
    commission,
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