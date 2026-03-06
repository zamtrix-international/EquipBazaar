const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class PaymentWebhookLog extends Model {}

PaymentWebhookLog.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    gateway: { type: DataTypes.ENUM("RAZORPAY", "CASHFREE"), allowNull: false },

    eventType: { type: DataTypes.STRING(120), allowNull: false },

    payloadJson: { type: DataTypes.TEXT("long"), allowNull: false },

    receivedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

    processed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

    processingNote: { type: DataTypes.STRING(255), allowNull: true },

    idempotencyKey: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  {
    sequelize,
    modelName: "PaymentWebhookLog",
    tableName: "payment_webhook_logs",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["idempotencyKey"] },
      { fields: ["gateway", "processed"] },
    ],
  }
);

module.exports = PaymentWebhookLog;