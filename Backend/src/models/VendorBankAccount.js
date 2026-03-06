const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class VendorBankAccount extends Model {}

VendorBankAccount.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    vendorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    accountHolderName: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },

    accountNumber: {
      type: DataTypes.STRING(64),
      allowNull: false,
      // NOTE: store encrypted in production if possible
    },

    ifsc: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    bankName: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    upiId: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "VendorBankAccount",
    tableName: "vendor_bank_accounts",
    timestamps: true,
    indexes: [
      { fields: ["vendorId"] },
      { fields: ["isPrimary"] },
    ],
  }
);

module.exports = VendorBankAccount;