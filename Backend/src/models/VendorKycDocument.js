const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class VendorKycDocument extends Model {}

VendorKycDocument.init(
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

    docType: {
      type: DataTypes.ENUM("AADHAAR", "PAN", "DL", "RC", "OTHER"),
      allowNull: false,
    },

    docNumber: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },

    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    reviewedByAdminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    reviewNote: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "VendorKycDocument",
    tableName: "vendor_kyc_documents",
    timestamps: true,
    indexes: [{ fields: ["vendorId"] }, { fields: ["status"] }],
  }
);

module.exports = VendorKycDocument;