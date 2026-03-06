const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class EquipmentAvailability extends Model {}

EquipmentAvailability.init(
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

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    note: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EquipmentAvailability",
    tableName: "equipment_availability",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["equipmentId", "date"] },
      { fields: ["date"] },
    ],
  }
);

module.exports = EquipmentAvailability;