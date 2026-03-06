const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class VendorWallet extends Model {}

VendorWallet.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    vendorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },

    availableBalance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    pendingBalance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    lifetimeEarnings: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "VendorWallet",
    tableName: "vendor_wallets",
    timestamps: true,
  }
);

module.exports = VendorWallet;