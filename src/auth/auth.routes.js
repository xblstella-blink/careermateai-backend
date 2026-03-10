const express = require("express");
const authController = require("./auth.controller");
const validate = require("../middleware/validation.middleware");
const { loginSchema, registerSchema } = require("./auth.validation");

const authRouter = express.Router();

authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/register", validate(registerSchema), authController.register);

module.exports = authRouter;
