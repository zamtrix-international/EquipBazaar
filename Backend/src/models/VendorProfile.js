const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class VendorProfile extends Model {}

VendorProfile.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },

    businessName: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },

    ownerName: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Meerut",
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
    modelName: "VendorProfile",
    tableName: "vendor_profiles",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["userId"] },
      { fields: ["city"] },
      { fields: ["isApproved"] },
    ],
  }
);

module.exports = VendorProfile;