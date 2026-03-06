const { Sequelize } = require("sequelize");

// NOTE: env is loaded in server.js before connecting
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false, // set true for SQL logs in dev if needed
    define: {
      underscored: false,
      freezeTableName: false,
      timestamps: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+05:30",
  }
);

module.exports = { sequelize };