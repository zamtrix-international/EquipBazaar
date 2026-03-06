/**
 * Wallet Controller
 * Handles wallet operations and balance management
 */

const asyncHandler = require('../utils/asyncHandler');
const walletService = require('../services/wallet.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Get wallet balance
 */
const getWalletBalance = asyncHandler(async (req, res) => {
  const balance = await walletService.getWalletBalance(req.user.id);
  res.status(200).json(new apiResponse(200, { balance }, 'Wallet balance retrieved'));
});

/**
 * Get wallet ledger
 */
const getWalletLedger = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const ledger = await walletService.getWalletLedger(req.user.id, page, limit);
  res.status(200).json(new apiResponse(200, ledger, 'Wallet ledger retrieved'));
});

/**
 * Add wallet funds
 */
const addWalletFunds = asyncHandler(async (req, res) => {
  const { amount, source } = req.body;

  const wallet = await walletService.addFunds(
    req.user.id,
    amount,
    source,
    req.body.reference
  );

  res.status(200).json(new apiResponse(200, wallet, 'Funds added to wallet'));
});

module.exports = {
  getWalletBalance,
  getWalletLedger,
  addWalletFunds,
};
