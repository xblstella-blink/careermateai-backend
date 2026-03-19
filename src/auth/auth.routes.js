const express = require("express");
const authController = require("./auth.controller");
const validate = require("../middleware/validation.middleware");
const {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} = require("./auth.validation");
const authGuard = require("../middleware/authGuard.middleware");
const { roleGuard } = require("../middleware/roleGuard.middleware");

const authRouter = express.Router();

authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/verify-code",
  validate(verifyCodeSchema),
  authController.verifyCode,
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);
authRouter.get("/private", authGuard, (req, res) => {
  res.json({
    success: true,
    message: "this is a private endpoint",
  });
});

authRouter.get("/admin", authGuard, roleGuard("admin"), (req, res) => {
  res.json({
    success: true,
    message: "this is an admin endpoint",
  });
});
authRouter.get("/user", authGuard, roleGuard("user"), (req, res) => {
  res.json({
    success: true,
    message: "this is a user endpoint",
  });
});

authRouter.get("/both", authGuard, roleGuard("admin", "user"), (req, res) => {
  res.json({
    success: true,
    message: "this is for both user and admin",
  });
});

module.exports = authRouter;
