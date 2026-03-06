/**
 * Payout Controller
 * Handles vendor payouts and withdrawals
 */

const asyncHandler = require('../utils/asyncHandler');
const payoutService = require('../services/payout.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Create withdrawal request
 */
const createWithdrawalRequest = asyncHandler(async (req, res) => {
  const request = await payoutService.createWithdrawalRequest(req.user.id, req.body);
  res.status(201).json(new apiResponse(201, request, 'Withdrawal request created'));
});

/**
 * Get withdrawal request
 */
const getWithdrawalRequest = asyncHandler(async (req, res) => {
  const request = await payoutService.getWithdrawalRequest(req.params.requestId);
  res.status(200).json(new apiResponse(200, request, 'Withdrawal request retrieved'));
});

/**
 * Get vendor payouts
 */
const getVendorPayouts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const payouts = await payoutService.getVendorPayouts(req.user.id, page, limit);
  res.status(200).json(new apiResponse(200, payouts, 'Vendor payouts retrieved'));
});

/**
 * Process withdrawal (admin only)
 */
const processWithdrawal = asyncHandler(async (req, res) => {
  const request = await payoutService.processWithdrawal(req.params.requestId);
  res.status(200).json(new apiResponse(200, request, 'Withdrawal processing initiated'));
});

module.exports = {
  createWithdrawalRequest,
  getWithdrawalRequest,
  getVendorPayouts,
  processWithdrawal,
};
