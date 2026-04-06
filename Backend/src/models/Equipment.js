const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class Equipment extends Model {}

Equipment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    vendorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    // Core marketplace fields
    type: {
      type: DataTypes.ENUM("TRACTOR", "JCB", "CRANE", "DUMPER"),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },

    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // Extra frontend-friendly fields
    name: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },

    dailyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    capacityLabel: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },

    kmRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    minimumHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1,
    },

    locationText: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Meerut",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    ratingAvg: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },

    ratingCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Equipment",
    tableName: "equipments",
    timestamps: true,
    indexes: [
      { fields: ["vendorId"] },
      { fields: ["type", "city", "isActive", "isApproved"] },
      { fields: ["category"] },
      { fields: ["name"] },
    ],
  }
);

module.exports = Equipment;