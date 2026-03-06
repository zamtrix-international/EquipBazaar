/**
 * Payout Service
 * Manages vendor payouts and withdrawal requests
 */

const PayoutTransaction = require('../models/PayoutTransaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const VendorWallet = require('../models/VendorWallet');
const VendorBankAccount = require('../models/VendorBankAccount');
const apiError = require('../utils/apiError');

/**
 * Create withdrawal request
 */
const createWithdrawalRequest = async (vendorId, withdrawalData) => {
  const wallet = await VendorWallet.findOne({ where: { vendorId } });

  if (!wallet || wallet.balance < withdrawalData.amount) {
    throw new apiError(400, 'Insufficient wallet balance');
  }

  const bankAccount = await VendorBankAccount.findByPk(withdrawalData.bankAccountId);
  if (!bankAccount) {
    throw new apiError(404, 'Bank account not found');
  }

  return await WithdrawalRequest.create({
    vendorId,
    ...withdrawalData,
    status: 'PENDING',
  });
};

/**
 * Get withdrawal request
 */
const getWithdrawalRequest = async (requestId) => {
  const request = await WithdrawalRequest.findByPk(requestId);
  if (!request) {
    throw new apiError(404, 'Withdrawal request not found');
  }
  return request;
};

/**
 * Process withdrawal
 */
const processWithdrawal = async (requestId) => {
  const request = await getWithdrawalRequest(requestId);

  if (request.status !== 'PENDING') {
    throw new apiError(400, `Cannot process ${request.status} withdrawal`);
  }

  // TODO: Integrate with payment gateway for bank transfer
  request.status = 'PROCESSING';
  await request.save();

  return request;
};

/**
 * Get vendor payouts
 */
const getVendorPayouts = async (vendorId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await PayoutTransaction.findAndCountAll({
    where: { vendorId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Create payout transaction
 */
const createPayoutTransaction = async (vendorId, payoutData) => {
  return await PayoutTransaction.create({
    vendorId,
    ...payoutData,
  });
};

module.exports = {
  createWithdrawalRequest,
  getWithdrawalRequest,
  processWithdrawal,
  getVendorPayouts,
  createPayoutTransaction,
};
