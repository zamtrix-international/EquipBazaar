const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class BookingStatusLog extends Model {}

BookingStatusLog.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    bookingId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    fromStatus: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    toStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    changedByUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BookingStatusLog",
    tableName: "booking_status_logs",
    timestamps: true,
    indexes: [{ fields: ["bookingId"] }, { fields: ["toStatus", "createdAt"] }],
  }
);

module.exports = BookingStatusLog;