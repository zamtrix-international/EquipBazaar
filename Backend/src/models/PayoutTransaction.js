const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class PayoutTransaction extends Model {}

PayoutTransaction.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    withdrawalRequestId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },

    vendorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

    method: {
      type: DataTypes.ENUM("BANK_TRANSFER", "UPI", "MANUAL"),
      allowNull: false,
      defaultValue: "MANUAL",
    },

    referenceNo: { type: DataTypes.STRING(120), allowNull: true },

    status: {
      type: DataTypes.ENUM("INITIATED", "SUCCESS", "FAILED"),
      allowNull: false,
      defaultValue: "INITIATED",
    },

    processedByAdminId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    processedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "PayoutTransaction",
    tableName: "payout_transactions",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["withdrawalRequestId"] },
      { fields: ["vendorId", "createdAt"] },
      { fields: ["status"] },
    ],
  }
);

module.exports = PayoutTransaction;