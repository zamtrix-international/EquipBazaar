const asyncHandler = require("../utils/asyncHandler");
const { ApiResponse } = require("../utils/apiResponse");
const settingsService = require("../services/settings.service");

const getPaymentGatewayConfig = asyncHandler(async (req, res) => {
  const configs = await settingsService.getPaymentGatewayConfig({
    gateway: req.query.gateway,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, configs, "Payment gateway config retrieved"));
});

const updatePaymentGatewayConfig = asyncHandler(async (req, res) => {
  const config = await settingsService.upsertPaymentGatewayConfig(
    req.body,
    req.user?.id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, config, "Payment gateway config updated"));
});

const getAppSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getAppSettings({
    keyName: req.query.keyName,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "App settings retrieved"));
});

const updateAppSetting = asyncHandler(async (req, res) => {
  const setting = await settingsService.upsertAppSetting(
    req.body,
    req.user?.id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, setting, "App setting updated"));
});

module.exports = {
  getPaymentGatewayConfig,
  updatePaymentGatewayConfig,
  getAppSettings,
  updateAppSetting,
};