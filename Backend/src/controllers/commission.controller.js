/**
 * Commission Controller
 * Handles commission rules and calculations
 */

const asyncHandler = require('../utils/asyncHandler');
const commissionService = require('../services/commission.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Get commission rule
 */
const getCommissionRule = asyncHandler(async (req, res) => {
  const rule = await commissionService.getCommissionRule(req.params.vendorId);
  res.status(200).json(new apiResponse(200, rule, 'Commission rule retrieved'));
});

/**
 * Update commission rule (admin only)
 */
const updateCommissionRule = asyncHandler(async (req, res) => {
  const rule = await commissionService.upsertCommissionRule(
    req.params.vendorId,
    req.body
  );

  res.status(200).json(new apiResponse(200, rule, 'Commission rule updated'));
});

/**
 * Calculate commission for booking
 */
const calculateCommission = asyncHandler(async (req, res) => {
  const commission = await commissionService.calculateCommission(req.params.bookingId);
  res.status(200).json(new apiResponse(200, commission, 'Commission calculated'));
});

module.exports = {
  getCommissionRule,
  updateCommissionRule,
  calculateCommission,
};
