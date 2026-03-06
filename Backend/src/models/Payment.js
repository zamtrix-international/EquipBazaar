const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class Payment extends Model {}

Payment.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    bookingId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    gateway: {
      type: DataTypes.ENUM("RAZORPAY", "CASHFREE"),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("CREATED", "PENDING", "SUCCESS", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "CREATED",
    },

    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(5), allowNull: false, defaultValue: "INR" },

    gatewayOrderId: { type: DataTypes.STRING(120), allowNull: true },
    gatewayPaymentId: { type: DataTypes.STRING(120), allowNull: true },
    gatewaySignature: { type: DataTypes.STRING(255), allowNull: true },

    paidAt: { type: DataTypes.DATE, allowNull: true },

    idempotencyKey: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
    indexes: [
      { fields: ["bookingId"] },
      { fields: ["status"] },
      { fields: ["gatewayOrderId"] },
      { fields: ["gatewayPaymentId"] },
      { unique: true, fields: ["idempotencyKey"] },
    ],
  }
);

module.exports = Payment;