const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class EquipmentImage extends Model {}

EquipmentImage.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    equipmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "EquipmentImage",
    tableName: "equipment_images",
    timestamps: true,
    indexes: [{ fields: ["equipmentId"] }],
  }
);

module.exports = EquipmentImage;