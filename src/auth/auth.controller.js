const ConflictException = require("../exceptions/conflict.exception");
const User = require("../users/user.model");
const { signAccessToken } = require("../utils/jwt");
const logger = require("../utils/logger");
const { hashPassword, comparePassword } = require("../utils/password");
const UnauthorizedException = require("../exceptions/unauthorized.exception");
const crypto = require("crypto");
const badRequestException = require("../exceptions/badRequest.exception");
const ValidationException = require("../exceptions/validation.exception");

const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  const existingUser = await User.findOne({ email }).exec();
  if (existingUser) {
    throw new ConflictException("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    passwordHistory: [hashedPassword],
  });

  logger.info("User registered", { userID: user._id });

  const accessToken = signAccessToken({ userID: user._id });

  res.json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (!user) {
    throw new UnauthorizedException(
      "Invalid email or password. Please try again.",
    );
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedException(
      "Invalid email or password. Please try again.",
    );
  }

  const accessToken = signAccessToken({ userId: user._id });

  res.json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).exec();
  if (!user) {
    //

    return res.json({
      sucess: true,
      message: "If the email exists, a verification code has been sent",
    });
  }
  const code = Math.random().toString().slice(2, 8);
  user.resetCode = code;
  user.resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // mock sending email action
  logger.info("Password reset code sent");
  res.json({
    success: true,
    // message: "Verification code sent",
    data: {
      code,
    },
  });
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email }).exec();
  //dayjs
  if (!user || user.resetCode !== code || user.resetCodeExpiry < new Date()) {
    throw new ValidationException("Invalid or expired code");
  }
  user.resetCode = undefined;
  user.resetCodeExpiry = undefined;

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  res.json({
    success: true,
    data: {
      resetToken,
    },
  });
};

const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  const user = await User.findOne({ email }).exec();
  if (
    !user ||
    user.resetToken !== resetToken ||
    user.resetTokenExpiry < new Date()
  ) {
    throw new ValidationException("Invalid or expired token");
  }

  for (const oldHash of user.passwordHistory) {
    const isSame = await comparePassword(newPassword, oldHash);
    if (isSame) {
      throw new badRequestException(
        "New password must not be the same with past password",
      );
    }
  }
  const hashedPassword = await hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  user.password = hashedPassword;
  user.passwordHistory.push(hashedPassword);
  if (user.passwordHistory.length > 5) {
    user.passwordHistory = user.passwordHistory.slice(-5);
  }
  await user.save();
  logger.info("Password reset successful", { userId: user._id });
  res.json({
    success: true,
    message: "Password reset successfully",
  });
};

module.exports = {
  login,
  register,
  forgotPassword,
  verifyCode,
  resetPassword,
};
