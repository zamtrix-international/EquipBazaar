const { ApiError } = require("../utils/apiError");

function validate(schema, where = "body") {
  return (req, res, next) => {
    const data = req[where] || {};
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      return next(new ApiError(400, "Validation error", error.details.map((d) => d.message)));
    }
    req[where] = value;
    next();
  };
}

module.exports = { validate };