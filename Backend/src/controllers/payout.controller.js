/**
 * Payout Controller
 * Handles vendor payouts and withdrawal requests
 */

const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const payoutService = require('../services/payout.service');

/**
 * Create withdrawal request
 */
const createWithdrawalRequest = asyncHandler(async (req, res) => {
  const request = await payoutService.createWithdrawalRequest(req.user.id, req.body);

  res
    .status(201)
    .json(new ApiResponse(201, request, 'Withdrawal request created'));
});

/**
 * Get withdrawal request
 */
const getWithdrawalRequest = asyncHandler(async (req, res) => {
  const request = await payoutService.getWithdrawalRequest(req.params.requestId);

  res
    .status(200)
    .json(new ApiResponse(200, request, 'Withdrawal request retrieved'));
});

/**
 * Get vendor payouts
 */
const getVendorPayouts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const payouts = await payoutService.getVendorPayouts(
    req.user.id,
    Number(page),
    Number(limit)
  );

  res
    .status(200)
    .json(new ApiResponse(200, payouts, 'Vendor payouts retrieved'));
});

/**
 * Process withdrawal (admin only)
 * Admin must provide payment transfer reference / transaction id
 */
const processWithdrawal = asyncHandler(async (req, res) => {
  const result = await payoutService.processWithdrawal(
    req.params.requestId,
    req.user.id,
    req.body || {}
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Withdrawal processed successfully'));
});

module.exports = {
  createWithdrawalRequest,
  getWithdrawalRequest,
  getVendorPayouts,
  processWithdrawal,
};