/**
 * Commission Controller
 * Handles commission rules and calculations
 */

const asyncHandler = require('../utils/asyncHandler');
const commissionService = require('../services/commission.service');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Get global commission rule
 */
const getCommissionRule = asyncHandler(async (req, res) => {
  const rule = await commissionService.getCommissionRule();

  res
    .status(200)
    .json(new ApiResponse(200, rule, 'Global commission rule retrieved'));
});

/**
 * Update global commission rule (admin only)
 */
const updateCommissionRule = asyncHandler(async (req, res) => {
  const { commissionPct } = req.body;

  if (commissionPct === undefined) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'commissionPct is required'));
  }

  const rule = await commissionService.upsertCommissionRule({
    scope: 'GLOBAL',
    commissionPct,
  });

  res
    .status(200)
    .json(new ApiResponse(200, rule, 'Global commission updated'));
});

/**
 * Calculate commission for booking
 */
const calculateCommission = asyncHandler(async (req, res) => {
  const commission = await commissionService.calculateCommission(
    req.params.bookingId
  );

  res
    .status(200)
    .json(new ApiResponse(200, commission, 'Commission calculated'));
});

module.exports = {
  getCommissionRule,
  updateCommissionRule,
  calculateCommission,
};
