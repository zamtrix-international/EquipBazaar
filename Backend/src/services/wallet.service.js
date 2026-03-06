/**
 * Wallet Service
 * Manages vendor wallet operations and balance
 */

const VendorWallet = require('../models/VendorWallet');
const VendorWalletLedger = require('../models/VendorWalletLedger');
const User = require('../models/User');
const apiError = require('../utils/apiError');

/**
 * Get or create wallet
 */
const getOrCreateWallet = async (vendorId) => {
  let wallet = await VendorWallet.findOne({
    where: { vendorId },
  });

  if (!wallet) {
    wallet = await VendorWallet.create({
      vendorId,
      balance: 0,
    });
  }

  return wallet;
};

/**
 * Get wallet balance
 */
const getWalletBalance = async (vendorId) => {
  const wallet = await getOrCreateWallet(vendorId);
  return wallet.balance;
};

/**
 * Add funds to wallet
 */
const addFunds = async (vendorId, amount, source, reference) => {
  const wallet = await getOrCreateWallet(vendorId);
  wallet.balance += amount;
  await wallet.save();

  await VendorWalletLedger.create({
    vendorId,
    type: 'CREDIT',
    amount,
    source,
    reference,
    balanceAfter: wallet.balance,
  });

  return wallet;
};

/**
 * Deduct funds from wallet
 */
const deductFunds = async (vendorId, amount, reason, reference) => {
  const wallet = await getOrCreateWallet(vendorId);

  if (wallet.balance < amount) {
    throw new apiError(400, 'Insufficient wallet balance');
  }

  wallet.balance -= amount;
  await wallet.save();

  await VendorWalletLedger.create({
    vendorId,
    type: 'DEBIT',
    amount,
    source: reason,
    reference,
    balanceAfter: wallet.balance,
  });

  return wallet;
};

/**
 * Get wallet ledger
 */
const getWalletLedger = async (vendorId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await VendorWalletLedger.findAndCountAll({
    where: { vendorId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

module.exports = {
  getOrCreateWallet,
  getWalletBalance,
  addFunds,
  deductFunds,
  getWalletLedger,
};
