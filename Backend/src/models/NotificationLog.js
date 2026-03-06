const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class NotificationLog extends Model {}

NotificationLog.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    channel: { type: DataTypes.ENUM("WHATSAPP", "SMS", "EMAIL"), allowNull: false },

    eventType: { type: DataTypes.STRING(120), allowNull: false },

    payload: { type: DataTypes.TEXT("long"), allowNull: true },

    status: { type: DataTypes.ENUM("QUEUED", "SENT", "FAILED"), allowNull: false, defaultValue: "QUEUED" },
  },
  {
    sequelize,
    modelName: "NotificationLog",
    tableName: "notification_logs",
    timestamps: true,
    indexes: [{ fields: ["userId", "createdAt"] }, { fields: ["status"] }],
  }
);

module.exports = NotificationLog;