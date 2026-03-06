const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class SupportTicket extends Model {}

SupportTicket.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    createdByUserId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    role: { type: DataTypes.ENUM("CUSTOMER", "VENDOR"), allowNull: false },

    category: {
      type: DataTypes.ENUM("PAYMENT", "BOOKING", "DELIVERY", "KYC", "TECH", "OTHER"),
      allowNull: false,
      defaultValue: "OTHER",
    },

    priority: { type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"), allowNull: false, defaultValue: "LOW" },

    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"),
      allowNull: false,
      defaultValue: "OPEN",
    },

    subject: { type: DataTypes.STRING(200), allowNull: false },

    assignedToAdminId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  },
  {
    sequelize,
    modelName: "SupportTicket",
    tableName: "support_tickets",
    timestamps: true,
    indexes: [{ fields: ["status"] }, { fields: ["createdByUserId", "createdAt"] }],
  }
);

module.exports = SupportTicket;