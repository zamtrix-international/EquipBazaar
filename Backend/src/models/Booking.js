const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class Booking extends Model {}

Booking.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    bookingCode: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },

    customerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    vendorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    equipmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    serviceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    estimatedHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },

    estimatedKm: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },

    locationText: {
      type: DataTypes.STRING(220),
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Meerut",
    },

    notes: {
      type: DataTypes.STRING(400),
      allowNull: true,
    },

    // Money
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    extraCharges: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },

    commissionPct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 10 },
    commissionAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    vendorNetAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },

    status: {
      type: DataTypes.ENUM(
        "REQUESTED",
        "ACCEPTED",
        "REJECTED",
        "PAID",
        "ON_THE_WAY",
        "WORK_STARTED",
        "DELIVERED",
        "COMPLETED",
        "DISPUTED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "REQUESTED",
    },

    requestedAt: { type: DataTypes.DATE, allowNull: true },
    acceptedAt: { type: DataTypes.DATE, allowNull: true },
    deliveredAt: { type: DataTypes.DATE, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    cancelledAt: { type: DataTypes.DATE, allowNull: true },

    autoApproveAt: {
      type: DataTypes.DATE,
      allowNull: true, // set when deliveredAt is set
    },
  },
  {
    sequelize,
    modelName: "Booking",
    tableName: "bookings",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["bookingCode"] },
      { fields: ["customerId", "createdAt"] },
      { fields: ["vendorId", "createdAt"] },
      { fields: ["equipmentId", "serviceDate"] },
      { fields: ["status", "autoApproveAt"] },
    ],
  }
);

module.exports = Booking;