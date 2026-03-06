const Joi = require("joi");
const { ROLES } = require("../constants/roles");

const authRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().min(8).max(20).required(),
  email: Joi.string().email().allow(null, ""),
  password: Joi.string().min(6).max(72).required(),

  // allow vendor signup from public register (admin approval later)
  role: Joi.string().valid(ROLES.CUSTOMER, ROLES.VENDOR).optional(),

  // vendor extra fields (only used if role=VENDOR)
  businessName: Joi.string().max(160).optional(),
  ownerName: Joi.string().max(160).optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(80).optional(),
});

const authLoginSchema = Joi.object({
  phoneOrEmail: Joi.string().min(3).max(180).required(),
  password: Joi.string().min(6).max(72).required(),
});

module.exports = { authRegisterSchema, authLoginSchema };