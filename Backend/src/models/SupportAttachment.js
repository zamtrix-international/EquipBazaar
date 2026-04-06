const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class SupportAttachment extends Model {}

SupportAttachment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    ticketId: {
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
    modelName: "SupportAttachment",
    tableName: "support_attachments",
    timestamps: true,
    indexes: [{ fields: ["ticketId"] }],
  }
);

module.exports = SupportAttachment;