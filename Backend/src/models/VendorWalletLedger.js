const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class VendorWalletLedger extends Model {}

VendorWalletLedger.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    vendorWalletId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    refType: {
      type: DataTypes.ENUM("BOOKING", "PAYOUT", "ADJUSTMENT", "PENALTY"),
      allowNull: false,
    },

    refId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },

    entryType: {
      type: DataTypes.ENUM("CREDIT", "DEBIT"),
      allowNull: false,
    },

    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

    description: { type: DataTypes.STRING(255), allowNull: true },

    idempotencyKey: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  {
    sequelize,
    modelName: "VendorWalletLedger",
    tableName: "vendor_wallet_ledger",
    timestamps: true,
    indexes: [
      { fields: ["vendorWalletId"] },
      { fields: ["refType", "refId"] },
      { unique: true, fields: ["idempotencyKey"] },
    ],
  }
);

module.exports = VendorWalletLedger;