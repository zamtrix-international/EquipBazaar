const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class PaymentGatewayConfig extends Model {}

PaymentGatewayConfig.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    gateway: {
      type: DataTypes.ENUM("RAZORPAY", "CASHFREE"),
      allowNull: false,
      unique: true,
    },

    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    mode: {
      type: DataTypes.ENUM("TEST", "LIVE"),
      allowNull: false,
      defaultValue: "TEST",
    },

    apiKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    apiSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    webhookSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    createdByAdminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    updatedByAdminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PaymentGatewayConfig",
    tableName: "payment_gateway_configs",
    timestamps: true,
    indexes: [{ unique: true, fields: ["gateway"] }],
  }
);

module.exports = PaymentGatewayConfig;