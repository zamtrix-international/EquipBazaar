const PaymentGatewayConfig = require("../models/PaymentGatewayConfig");
const AppSetting = require("../models/AppSetting");
const ApiError = require("../utils/apiError");

const maskSecret = (value) => {
  if (!value) return null;
  if (value.length <= 6) return "******";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
};

const sanitizeGatewayConfig = (record) => ({
  id: record.id,
  gateway: record.gateway,
  isEnabled: record.isEnabled,
  mode: record.mode,
  apiKey: record.apiKey ? maskSecret(record.apiKey) : null,
  apiSecret: record.apiSecret ? maskSecret(record.apiSecret) : null,
  webhookSecret: record.webhookSecret ? maskSecret(record.webhookSecret) : null,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const getPaymentGatewayConfig = async ({ gateway } = {}) => {
  const where = gateway ? { gateway } : undefined;
  const rows = await PaymentGatewayConfig.findAll({
    ...(where ? { where } : {}),
    order: [["gateway", "ASC"]],
  });

  if (gateway && rows.length === 0) {
    throw new ApiError(404, `Payment gateway config not found for ${gateway}`);
  }

  return rows.map(sanitizeGatewayConfig);
};

const upsertPaymentGatewayConfig = async ({ gateway, mode, isEnabled, apiKey, apiSecret, webhookSecret }, adminId) => {
  const [row, created] = await PaymentGatewayConfig.findOrCreate({
    where: { gateway },
    defaults: {
      gateway,
      mode,
      isEnabled,
      apiKey,
      apiSecret,
      webhookSecret,
      createdByAdminId: adminId || null,
      updatedByAdminId: adminId || null,
    },
  });

  if (!created) {
    await row.update({
      mode,
      isEnabled,
      apiKey,
      apiSecret,
      webhookSecret,
      updatedByAdminId: adminId || null,
    });
  }

  return sanitizeGatewayConfig(row);
};

const getAppSettings = async ({ keyName } = {}) => {
  const where = keyName ? { keyName } : undefined;
  const rows = await AppSetting.findAll({
    ...(where ? { where } : {}),
    order: [["keyName", "ASC"]],
  });

  if (keyName && rows.length === 0) {
    throw new ApiError(404, `App setting not found for key: ${keyName}`);
  }

  return rows.map((row) => ({
    keyName: row.keyName,
    valueText: row.valueText,
    updatedByAdminId: row.updatedByAdminId,
    updatedAt: row.updatedAt,
  }));
};

const upsertAppSetting = async ({ keyName, valueText }, adminId) => {
  const [row, created] = await AppSetting.findOrCreate({
    where: { keyName },
    defaults: {
      keyName,
      valueText,
      updatedByAdminId: adminId || null,
    },
  });

  if (!created) {
    await row.update({
      valueText,
      updatedByAdminId: adminId || null,
    });
  }

  return {
    keyName: row.keyName,
    valueText: row.valueText,
    updatedByAdminId: row.updatedByAdminId,
    updatedAt: row.updatedAt,
  };
};

module.exports = {
  getPaymentGatewayConfig,
  upsertPaymentGatewayConfig,
  getAppSettings,
  upsertAppSetting,
};
