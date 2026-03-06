const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class AuditLog extends Model {}

AuditLog.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    actorUserId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },

    action: { type: DataTypes.STRING(120), allowNull: false },

    entityType: { type: DataTypes.STRING(80), allowNull: true },
    entityId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },

    metaJson: { type: DataTypes.TEXT("long"), allowNull: true },
  },
  {
    sequelize,
    modelName: "AuditLog",
    tableName: "audit_logs",
    timestamps: true,
    indexes: [{ fields: ["actorUserId", "createdAt"] }, { fields: ["entityType", "entityId"] }],
  }
);

module.exports = AuditLog;