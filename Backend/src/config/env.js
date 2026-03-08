const dotenv = require("dotenv");
const Joi = require("joi");

let loaded = false;

function loadEnv() {
  if (loaded) return;

  dotenv.config();

  const schema = Joi.object({
    NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
    PORT: Joi.number().default(5000),
    TRUST_PROXY: Joi.alternatives().try(Joi.boolean(), Joi.string().valid("true", "false")).default("false"),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().allow("").default(""),

    JWT_SECRET: Joi.string().min(16).required(),
    JWT_EXPIRES_IN: Joi.string().default("7d"),

    // DEV only: set true if you want sequelize.sync({ alter:true })
    DB_SYNC: Joi.string().valid("true", "false").default("false"),

    // Upload/storage
    STORAGE_PROVIDER: Joi.string().valid("local", "s3").default("local"),
    LOCAL_UPLOAD_DIR: Joi.string().default("uploads"),
    CORS_ALLOWED_ORIGINS: Joi.string().allow("").default(""),

    // Optional webhook secrets
    RAZORPAY_WEBHOOK_SECRET: Joi.string().allow("").default(""),
    CASHFREE_WEBHOOK_SECRET: Joi.string().allow("").default(""),

    // Optional S3 (future)
    S3_ENDPOINT: Joi.string().allow(""),
    S3_REGION: Joi.string().allow(""),
    S3_BUCKET: Joi.string().allow(""),
    S3_ACCESS_KEY: Joi.string().allow(""),
    S3_SECRET_KEY: Joi.string().allow(""),
  }).unknown(true);

  const { error, value } = schema.validate(process.env);
  if (error) {
    throw new Error(`❌ Environment validation error: ${error.message}`);
  }

  process.env.NODE_ENV = value.NODE_ENV;
  process.env.PORT = String(value.PORT);
  process.env.TRUST_PROXY = String(value.TRUST_PROXY);

  process.env.DB_HOST = value.DB_HOST;
  process.env.DB_PORT = String(value.DB_PORT);
  process.env.DB_NAME = value.DB_NAME;
  process.env.DB_USER = value.DB_USER;
  process.env.DB_PASS = value.DB_PASS;

  process.env.JWT_SECRET = value.JWT_SECRET;
  process.env.JWT_EXPIRES_IN = value.JWT_EXPIRES_IN;

  process.env.DB_SYNC = value.DB_SYNC;

  process.env.STORAGE_PROVIDER = value.STORAGE_PROVIDER;
  process.env.LOCAL_UPLOAD_DIR = value.LOCAL_UPLOAD_DIR;
  process.env.CORS_ALLOWED_ORIGINS = value.CORS_ALLOWED_ORIGINS || "";

  process.env.RAZORPAY_WEBHOOK_SECRET = value.RAZORPAY_WEBHOOK_SECRET || "";
  process.env.CASHFREE_WEBHOOK_SECRET = value.CASHFREE_WEBHOOK_SECRET || "";

  process.env.S3_ENDPOINT = value.S3_ENDPOINT || "";
  process.env.S3_REGION = value.S3_REGION || "";
  process.env.S3_BUCKET = value.S3_BUCKET || "";
  process.env.S3_ACCESS_KEY = value.S3_ACCESS_KEY || "";
  process.env.S3_SECRET_KEY = value.S3_SECRET_KEY || "";

  loaded = true;
}

module.exports = { loadEnv };
