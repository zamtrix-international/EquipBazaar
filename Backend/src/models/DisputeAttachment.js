const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class DisputeAttachment extends Model {}

DisputeAttachment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    disputeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "DisputeAttachment",
    tableName: "dispute_attachments",
    timestamps: true,
    indexes: [{ fields: ["disputeId"] }],
  }
);

module.exports = DisputeAttachment;