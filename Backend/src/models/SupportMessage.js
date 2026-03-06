const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class SupportMessage extends Model {}

SupportMessage.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    ticketId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    senderUserId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    message: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: "SupportMessage",
    tableName: "support_messages",
    timestamps: true,
    indexes: [{ fields: ["ticketId"] }],
  }
);

module.exports = SupportMessage;