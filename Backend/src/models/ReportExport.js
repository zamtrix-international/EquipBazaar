const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class ReportExport extends Model {}

ReportExport.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    requestedByUserId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    reportType: { type: DataTypes.STRING(120), allowNull: false },

    filtersJson: { type: DataTypes.TEXT("long"), allowNull: true },

    fileUrl: { type: DataTypes.STRING(500), allowNull: true },

    status: { type: DataTypes.ENUM("PENDING", "READY", "FAILED"), allowNull: false, defaultValue: "PENDING" },
  },
  {
    sequelize,
    modelName: "ReportExport",
    tableName: "report_exports",
    timestamps: true,
    indexes: [{ fields: ["requestedByUserId", "createdAt"] }, { fields: ["status"] }],
  }
);

module.exports = ReportExport;