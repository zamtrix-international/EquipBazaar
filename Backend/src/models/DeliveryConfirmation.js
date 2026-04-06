const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class DeliveryConfirmation extends Model {}

DeliveryConfirmation.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    bookingId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },

    // Existing newer structure
    deliveredByVendorUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    proofUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    customerApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    customerApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    autoApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    autoApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Backward-compatible pickup fields
    pickupDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    pickupPhotos: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    pickupNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Backward-compatible return/delivery fields
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    returnPhotos: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    returnNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DeliveryConfirmation",
    tableName: "delivery_confirmations",
    timestamps: true,
    indexes: [{ unique: true, fields: ["bookingId"] }],
  }
);

module.exports = DeliveryConfirmation;