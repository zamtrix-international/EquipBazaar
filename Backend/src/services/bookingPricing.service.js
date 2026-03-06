/**
 * Booking Pricing Service
 * Calculates pricing, taxes, discounts, and commissions
 */

const CommissionRule = require('../models/CommissionRule');
const apiError = require('../utils/apiError');

/**
 * Calculate booking price
 */
const calculateBookingPrice = async (equipmentId, days, vendorId) => {
  // TODO: Get equipment daily rate from Equipment model
  const basePrice = 1000 * days; // Placeholder

  const commissionRule = await CommissionRule.findOne({
    where: { vendorId },
  });

  const commissionRate = commissionRule ? commissionRule.commissionRate : 0.1; // 10% default
  const commission = basePrice * commissionRate;
  const totalAmount = basePrice + commission;

  return {
    basePrice,
    commission,
    commissionRate: commissionRate * 100,
    totalAmount,
  };
};

/**
 * Apply coupon/discount
 */
const applyDiscount = async (totalAmount, discountCode) => {
  // TODO: Implement discount logic
  return totalAmount;
};

/**
 * Calculate tax
 */
const calculateTax = async (amount, state) => {
  // TODO: Implement GST calculation based on state
  const taxRate = 0.18; // 18% GST default
  return amount * taxRate;
};

module.exports = {
  calculateBookingPrice,
  applyDiscount,
  calculateTax,
};
