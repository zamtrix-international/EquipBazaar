const Joi = require("joi");

const schemas = {
  idParam: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

module.exports = { Joi, schemas };