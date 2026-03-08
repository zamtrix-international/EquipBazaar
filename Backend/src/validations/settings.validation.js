const Joi = require("joi");

const gatewaySchema = Joi.string().valid("RAZORPAY", "CASHFREE");

const paymentGatewayQuerySchema = Joi.object({
  gateway: gatewaySchema.optional(),
});

const upsertPaymentGatewayConfigSchema = Joi.object({
  gateway: gatewaySchema.required(),
  isEnabled: Joi.boolean().required(),
  mode: Joi.string().valid("TEST", "LIVE").required(),
  apiKey: Joi.string().allow("", null).default(""),
  apiSecret: Joi.string().allow("", null).default(""),
  webhookSecret: Joi.string().allow("", null).default(""),
});

const appSettingsQuerySchema = Joi.object({
  keyName: Joi.string().max(120).optional(),
});

const upsertAppSettingSchema = Joi.object({
  keyName: Joi.string().max(120).required(),
  valueText: Joi.string().allow("").required(),
});

module.exports = {
  paymentGatewayQuerySchema,
  upsertPaymentGatewayConfigSchema,
  appSettingsQuerySchema,
  upsertAppSettingSchema,
};
