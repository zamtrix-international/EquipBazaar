const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      trim: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(180),
      allowNull: true,
      unique: true,
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("ADMIN", "CUSTOMER", "VENDOR"),
      allowNull: false,
      defaultValue: "CUSTOMER",
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "BLOCKED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["phone"] },
      { unique: true, fields: ["email"] },
      { fields: ["role"] },
      { fields: ["status"] },
    ],
  }
);

module.exports = User;