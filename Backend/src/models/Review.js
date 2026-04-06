const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class Review extends Model {}

Review.init(
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

    equipmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    vendorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    customerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["bookingId"] },
      { fields: ["vendorId", "createdAt"] },
      { fields: ["equipmentId", "createdAt"] },
      { fields: ["customerId", "createdAt"] },
    ],
  }
);

module.exports = Review;