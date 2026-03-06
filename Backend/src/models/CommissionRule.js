const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class CommissionRule extends Model {}

CommissionRule.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    scope: { type: DataTypes.ENUM("GLOBAL", "VENDOR", "EQUIPMENT"), allowNull: false },

    vendorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    equipmentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },

    commissionPct: { type: DataTypes.DECIMAL(5, 2), allowNull: false },

    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "CommissionRule",
    tableName: "commission_rules",
    timestamps: true,
    indexes: [{ fields: ["scope", "isActive"] }, { fields: ["vendorId"] }, { fields: ["equipmentId"] }],
  }
);

module.exports = CommissionRule;