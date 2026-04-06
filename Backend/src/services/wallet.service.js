/**
 * Wallet Service — uses DB transactions to prevent race conditions
 */

const { sequelize } = require("../config/db");
const VendorWallet = require("../models/VendorWallet");
const VendorWalletLedger = require("../models/VendorWalletLedger");
const VendorProfile = require("../models/VendorProfile");
const { ApiError } = require("../utils/apiError");
const { makeIdempotencyKey } = require("../utils/idempotency");

const normalizeAmount = (amount) => {
  const parsed = Number(amount);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ApiError(400, "Amount must be a valid number greater than 0");
  }

  return Number(parsed.toFixed(2));
};

const resolveVendorIdFromUser = async (userId) => {
  const vendorProfile = await VendorProfile.findOne({
    where: { userId },
  });

  if (!vendorProfile) {
    throw new ApiError(404, "Vendor profile not found");
  }

  return vendorProfile.id;
};

const getWalletByVendorId = async (vendorId) => {
  const wallet = await VendorWallet.findOne({ where: { vendorId } });

  if (!wallet) {
    throw new ApiError(404, "Wallet not found for this vendor");
  }

  return wallet;
};

const getWalletBalance = async (vendorId) => {
  const wallet = await getWalletByVendorId(vendorId);

  return {
    vendorId,
    availableBalance: Number(parseFloat(wallet.availableBalance).toFixed(2)),
    pendingBalance: Number(parseFloat(wallet.pendingBalance).toFixed(2)),
    lifetimeEarnings: Number(parseFloat(wallet.lifetimeEarnings).toFixed(2)),
  };
};

const addFunds = async (
  vendorId,
  amount,
  refType = "ADJUSTMENT",
  refId = null,
  description = "",
  idempKey = null,
  externalTransaction = null
) => {
  const safeAmount = normalizeAmount(amount);
  const t = externalTransaction || (await sequelize.transaction());

  try {
    const wallet = await VendorWallet.findOne({
      where: { vendorId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    const idempotencyKey =
      idempKey ||
      makeIdempotencyKey(`credit-${vendorId}-${refType}-${refId || "NA"}`);

    const existingLedger = await VendorWalletLedger.findOne({
      where: { idempotencyKey },
      transaction: t,
    });

    if (existingLedger) {
      if (!externalTransaction) await t.commit();
      return wallet;
    }

    wallet.availableBalance = Number(
      (parseFloat(wallet.availableBalance) + safeAmount).toFixed(2)
    );

    wallet.lifetimeEarnings = Number(
      (parseFloat(wallet.lifetimeEarnings) + safeAmount).toFixed(2)
    );

    await wallet.save({ transaction: t });

    await VendorWalletLedger.create(
      {
        vendorWalletId: wallet.id,
        entryType: "CREDIT",
        refType,
        refId,
        amount: safeAmount,
        description,
        idempotencyKey,
      },
      { transaction: t }
    );

    if (!externalTransaction) await t.commit();
    return wallet;
  } catch (err) {
    if (!externalTransaction) await t.rollback();
    throw err;
  }
};

const deductFunds = async (
  vendorId,
  amount,
  refType = "ADJUSTMENT",
  refId = null,
  description = "",
  idempKey = null
) => {
  const safeAmount = normalizeAmount(amount);
  const t = await sequelize.transaction();

  try {
    const wallet = await VendorWallet.findOne({
      where: { vendorId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    const idempotencyKey =
      idempKey ||
      makeIdempotencyKey(`debit-${vendorId}-${refType}-${refId || "NA"}`);

    const existingLedger = await VendorWalletLedger.findOne({
      where: { idempotencyKey },
      transaction: t,
    });

    if (existingLedger) {
      await t.commit();
      return wallet;
    }

    if (parseFloat(wallet.availableBalance) < safeAmount) {
      throw new ApiError(400, "Insufficient wallet balance");
    }

    wallet.availableBalance = Number(
      (parseFloat(wallet.availableBalance) - safeAmount).toFixed(2)
    );

    await wallet.save({ transaction: t });

    await VendorWalletLedger.create(
      {
        vendorWalletId: wallet.id,
        entryType: "DEBIT",
        refType,
        refId,
        amount: safeAmount,
        description,
        idempotencyKey,
      },
      { transaction: t }
    );

    await t.commit();
    return wallet;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const settlePending = async (vendorId, amount, refId = null) => {
  const safeAmount = normalizeAmount(amount);
  const t = await sequelize.transaction();

  try {
    const wallet = await VendorWallet.findOne({
      where: { vendorId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    const idempotencyKey = makeIdempotencyKey(
      `settle-${vendorId}-${refId || "NA"}`
    );

    const existingLedger = await VendorWalletLedger.findOne({
      where: { idempotencyKey },
      transaction: t,
    });

    if (existingLedger) {
      await t.commit();
      return wallet;
    }

    const pending = parseFloat(wallet.pendingBalance);

    if (pending < safeAmount) {
      throw new ApiError(400, "Pending balance insufficient");
    }

    wallet.pendingBalance = Number((pending - safeAmount).toFixed(2));
    wallet.availableBalance = Number(
      (parseFloat(wallet.availableBalance) + safeAmount).toFixed(2)
    );

    await wallet.save({ transaction: t });

    await VendorWalletLedger.create(
      {
        vendorWalletId: wallet.id,
        entryType: "CREDIT",
        refType: "BOOKING",
        refId,
        amount: safeAmount,
        description: "Booking payment settled",
        idempotencyKey,
      },
      { transaction: t }
    );

    await t.commit();
    return wallet;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/**
 * Credit vendor wallet for completed booking settlement
 * Idempotent per booking
 */
const creditBookingSettlement = async (
  vendorId,
  amount,
  bookingId,
  externalTransaction = null
) => {
  const safeAmount = normalizeAmount(amount);

  return await addFunds(
    vendorId,
    safeAmount,
    "BOOKING",
    bookingId,
    "Booking settlement credited after completion",
    makeIdempotencyKey(`booking-settlement-${vendorId}-${bookingId}`),
    externalTransaction
  );
};

const getWalletLedger = async (vendorId, page = 1, limit = 10) => {
  const wallet = await getWalletByVendorId(vendorId);

  page = Math.max(Number(page) || 1, 1);
  limit = Math.max(Number(limit) || 10, 1);

  const offset = (page - 1) * limit;

  return await VendorWalletLedger.findAndCountAll({
    where: { vendorWalletId: wallet.id },
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  resolveVendorIdFromUser,
  getWalletByVendorId,
  getWalletBalance,
  addFunds,
  deductFunds,
  settlePending,
  creditBookingSettlement,
  getWalletLedger,
};