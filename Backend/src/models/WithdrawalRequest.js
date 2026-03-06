const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class WithdrawalRequest extends Model {}

WithdrawalRequest.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    vendorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    requestedAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "PAID"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    requestedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

    reviewedByAdminId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    reviewNote: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    modelName: "WithdrawalRequest",
    tableName: "withdrawal_requests",
    timestamps: true,
    indexes: [
      { fields: ["vendorId", "status"] },
      { fields: ["status"] },
    ],
  }
);

module.exports = WithdrawalRequest;