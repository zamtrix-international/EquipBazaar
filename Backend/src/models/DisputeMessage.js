const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class DisputeMessage extends Model {}

DisputeMessage.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    disputeId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    senderUserId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    message: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: "DisputeMessage",
    tableName: "dispute_messages",
    timestamps: true,
    indexes: [{ fields: ["disputeId"] }],
  }
);

module.exports = DisputeMessage;