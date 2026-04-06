/**
 * Wallet Controller
 */

const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const walletService = require("../services/wallet.service");

const resolveVendorIdForWallet = async (req) => {
  if (req.user.role === "VENDOR") {
    return await walletService.resolveVendorIdFromUser(req.user.id);
  }

  if (req.user.role === "ADMIN") {
    const vendorId = Number(req.query.vendorId || req.params.vendorId);

    if (!vendorId) {
      throw new ApiError(400, "vendorId is required for admin");
    }

    return vendorId;
  }

  throw new ApiError(403, "You are not allowed to access wallet");
};

const getWalletBalance = asyncHandler(async (req, res) => {
  const vendorId = await resolveVendorIdForWallet(req);
  const balance = await walletService.getWalletBalance(vendorId);

  res
    .status(200)
    .json(new ApiResponse(200, balance, "Wallet balance retrieved"));
});

const getWalletLedger = asyncHandler(async (req, res) => {
  const vendorId = await resolveVendorIdForWallet(req);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);

  const ledger = await walletService.getWalletLedger(vendorId, page, limit);

  res
    .status(200)
    .json(new ApiResponse(200, ledger, "Wallet ledger retrieved"));
});

module.exports = {
  getWalletBalance,
  getWalletLedger,
};