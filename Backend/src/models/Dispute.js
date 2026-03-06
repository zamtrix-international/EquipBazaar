const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class Dispute extends Model {}

Dispute.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    bookingId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },

    raisedByUserId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    reasonCategory: {
      type: DataTypes.ENUM("PAYMENT", "SERVICE", "BEHAVIOR", "EQUIPMENT", "OTHER"),
      allowNull: false,
      defaultValue: "OTHER",
    },

    description: { type: DataTypes.TEXT, allowNull: false },

    status: {
      type: DataTypes.ENUM("OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"),
      allowNull: false,
      defaultValue: "OPEN",
    },

    resolvedByAdminId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    resolutionNote: { type: DataTypes.TEXT, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "Dispute",
    tableName: "disputes",
    timestamps: true,
    indexes: [{ unique: true, fields: ["bookingId"] }, { fields: ["status"] }],
  }
);

module.exports = Dispute;