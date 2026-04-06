/**
 * Payout Service
 * Manages vendor payouts and withdrawal requests
 */

const { sequelize } = require('../config/db');
const PayoutTransaction = require('../models/PayoutTransaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const VendorWallet = require('../models/VendorWallet');
const VendorWalletLedger = require('../models/VendorWalletLedger');
const VendorBankAccount = require('../models/VendorBankAccount');
const VendorProfile = require('../models/VendorProfile');
const { ApiError } = require('../utils/apiError');
const { makeIdempotencyKey } = require('../utils/idempotency');

const normalizeAmount = (value) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ApiError(400, 'Invalid withdrawal amount');
  }

  return Number(parsed.toFixed(2));
};

const resolveVendorIdFromUser = async (userId) => {
  const vendorProfile = await VendorProfile.findOne({
    where: { userId },
  });

  if (!vendorProfile) {
    throw new ApiError(404, 'Vendor profile not found');
  }

  return vendorProfile.id;
};

/**
 * Create withdrawal request
 * Rule:
 * - request amount cannot exceed current available wallet balance
 * - wallet deduction will happen only when admin marks payout as actually paid
 */
const createWithdrawalRequest = async (userId, withdrawalData) => {
  const vendorId = await resolveVendorIdFromUser(userId);
  const requestedAmount = normalizeAmount(
    withdrawalData.requestedAmount ?? withdrawalData.amount
  );

  const wallet = await VendorWallet.findOne({ where: { vendorId } });

  if (!wallet) {
    throw new ApiError(404, 'Wallet not found');
  }

  if (Number(wallet.availableBalance) < requestedAmount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  const bankAccountId = withdrawalData.bankAccountId || null;

  if (bankAccountId) {
    const bankAccount = await VendorBankAccount.findByPk(bankAccountId);

    if (!bankAccount) {
      throw new ApiError(404, 'Bank account not found');
    }

    if (bankAccount.vendorId !== vendorId) {
      throw new ApiError(403, 'Bank account does not belong to this vendor');
    }
  }

  return await WithdrawalRequest.create({
    vendorId,
    bankAccountId,
    requestedAmount,
    status: 'PENDING',
  });
};

/**
 * Get withdrawal request
 */
const getWithdrawalRequest = async (requestId) => {
  const request = await WithdrawalRequest.findByPk(requestId);

  if (!request) {
    throw new ApiError(404, 'Withdrawal request not found');
  }

  return request;
};

/**
 * Process withdrawal
 * Final payout step:
 * - admin provides payment transfer referenceNo / transactionId
 * - only then wallet amount is deducted
 * - withdrawal becomes PAID
 * - payout transaction becomes SUCCESS
 */
const processWithdrawal = async (requestId, adminUserId, processData = {}) => {
  return await sequelize.transaction(async (t) => {
    const request = await WithdrawalRequest.findByPk(requestId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!request) {
      throw new ApiError(404, 'Withdrawal request not found');
    }

    if (request.status !== 'PENDING' && request.status !== 'APPROVED') {
      throw new ApiError(400, `Cannot process ${request.status} withdrawal`);
    }

    const referenceNo =
      processData.referenceNo ||
      processData.transactionId ||
      processData.txnId ||
      null;

    if (!referenceNo) {
      throw new ApiError(
        400,
        'referenceNo or transactionId is required to mark payout as paid'
      );
    }

    const wallet = await VendorWallet.findOne({
      where: { vendorId: request.vendorId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    const requestedAmount = Number(request.requestedAmount);

    if (Number(wallet.availableBalance) < requestedAmount) {
      throw new ApiError(400, 'Insufficient wallet balance');
    }

    const payoutMethod = processData.method || 'MANUAL';

    let payout = await PayoutTransaction.findOne({
      where: { withdrawalRequestId: request.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!payout) {
      payout = await PayoutTransaction.create(
        {
          withdrawalRequestId: request.id,
          vendorId: request.vendorId,
          amount: request.requestedAmount,
          method: payoutMethod,
          referenceNo,
          status: 'SUCCESS',
          processedByAdminId: adminUserId || null,
          processedAt: new Date(),
        },
        { transaction: t }
      );
    } else {
      if (payout.status === 'SUCCESS') {
        return {
          request,
          payout,
        };
      }

      payout.method = payoutMethod;
      payout.referenceNo = referenceNo;
      payout.status = 'SUCCESS';
      payout.processedByAdminId = adminUserId || payout.processedByAdminId;
      payout.processedAt = new Date();

      await payout.save({ transaction: t });
    }

    const idempotencyKey = makeIdempotencyKey(
      `withdrawal-paid-${request.vendorId}-${request.id}`
    );

    const existingLedger = await VendorWalletLedger.findOne({
      where: { idempotencyKey },
      transaction: t,
    });

    if (!existingLedger) {
      wallet.availableBalance = Number(
        (Number(wallet.availableBalance) - requestedAmount).toFixed(2)
      );

      await wallet.save({ transaction: t });

      await VendorWalletLedger.create(
        {
          vendorWalletId: wallet.id,
          entryType: 'DEBIT',
          refType: 'PAYOUT',
          refId: request.id,
          amount: requestedAmount,
          description: `Withdrawal paid. Ref: ${referenceNo}`,
          idempotencyKey,
        },
        { transaction: t }
      );
    }

    request.status = 'PAID';
    request.reviewedByAdminId = adminUserId || null;
    request.reviewNote =
      processData.reviewNote ||
      processData.note ||
      `Withdrawal paid. Ref: ${referenceNo}`;

    await request.save({ transaction: t });

    return {
      request,
      payout,
      wallet: {
        vendorId: request.vendorId,
        availableBalance: Number(Number(wallet.availableBalance).toFixed(2)),
        pendingBalance: Number(Number(wallet.pendingBalance).toFixed(2)),
        lifetimeEarnings: Number(Number(wallet.lifetimeEarnings).toFixed(2)),
      },
    };
  });
};

/**
 * Get vendor payouts
 */
const getVendorPayouts = async (userId, page = 1, limit = 10) => {
  const vendorId = await resolveVendorIdFromUser(userId);
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
  resolveVendorIdFromUser,
  createWithdrawalRequest,
  getWithdrawalRequest,
  processWithdrawal,
  getVendorPayouts,
  createPayoutTransaction,
};