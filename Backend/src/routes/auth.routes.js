const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validate.middleware");
const { authRegisterSchema, authLoginSchema } = require("../validations/auth.validation");

// Public
router.post("/register", validate(authRegisterSchema), authController.register);
router.post("/login", validate(authLoginSchema), authController.login);

module.exports = router;