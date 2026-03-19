const BadRequestException = require("../exceptions/badRequest.exception");
const NotFoundException = require("../exceptions/notFound.exception");
const logger = require("../utils/logger");
const { comparePassword, hashPassword } = require("../utils/password");
const User = require("./user.model");

const getMe = async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId).exec();

  if (!user) {
    throw new NotFoundException("User not found");
  }
  res.json({
    success: true,
    data: user,
  });
};

const updateMe = async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  res.json({ success: true, data: user });
};

const updateMyPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;
  const user = await User.findById(userId).exec();
  await User.findById(userId).exec();
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new BadRequestException("Current password is incorrect");
  }

  for (const oldHash of user.passwordHistory) {
    const isSame = await comparePassword(newPassword, oldHash);
    if (isSame) {
      throw new BadRequestException(
        "New password must not be the same with recent password",
      );
    }
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.passwordHistory.push(hashedPassword);
  if (user.passwordHistory > 5) {
    user.passwordHistory = user.passwordHistory.slice(-5);
  }
  await user.save();
  logger.info("Password update successful", { userId: user._id });

  res.json({
    success: true,
    message: "Password updated successfully",
  });
};

module.exports = { getMe, updateMe, updateMyPassword };
