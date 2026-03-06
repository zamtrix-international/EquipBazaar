const { sequelize, VendorWallet, VendorWalletLedger } = require("../models");
const ApiError = require("../utils/apiError");

const addFunds = async (vendorId, amount, source, reference) => {

  const t = await sequelize.transaction();

  try {

    const wallet = await VendorWallet.findOne({
      where: { vendorId },
      lock: true,
      transaction: t
    });

    wallet.availableBalance += amount;

    await wallet.save({ transaction: t });

    await VendorWalletLedger.create({
      vendorId,
      type: "CREDIT",
      amount,
      source,
      reference,
      balanceAfter: wallet.availableBalance
    }, { transaction: t });

    await t.commit();

    return wallet;

  } catch (err) {

    await t.rollback();

    throw err;
  }
};

module.exports = {
  addFunds
};