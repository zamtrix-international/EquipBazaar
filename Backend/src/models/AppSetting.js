const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class AppSetting extends Model {}

AppSetting.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    keyName: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    valueText: { type: DataTypes.TEXT, allowNull: false },

    updatedByAdminId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  },
  {
    sequelize,
    modelName: "AppSetting",
    tableName: "app_settings",
    timestamps: true,
  }
);

module.exports = AppSetting;