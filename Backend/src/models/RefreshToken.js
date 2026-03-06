const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class RefreshToken extends Model {}

RefreshToken.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    tokenHash: { type: DataTypes.STRING(255), allowNull: false },

    expiresAt: { type: DataTypes.DATE, allowNull: false },

    revokedAt: { type: DataTypes.DATE, allowNull: true },
    deviceInfo: { type: DataTypes.STRING(255), allowNull: true },
    ipAddress: { type: DataTypes.STRING(60), allowNull: true },
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["expiresAt"] }],
  }
);

module.exports = RefreshToken;