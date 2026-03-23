const { success, config } = require("zod");
const BadRequestException = require("../exceptions/badRequest.exception");
const ForbiddenException = require("../exceptions/forbidden.exception");
const NotFoundException = require("../exceptions/notFound.exception");
const { ALLOWED_TYPES, MAX_FILE_SIZE } = require("../upload/constants");
const logger = require("../utils/logger");
const { comparePassword, hashPassword } = require("../utils/password");
const { validateS3File, deleteObject } = require("../utils/s3");
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

const updateAvatar = async (req, res) => {
  const { fileKey } = req.body;
  const userId = req.user.userId;

  if (!fileKey.startsWith(`avatar/${userId}/`)) {
    throw new ForbiddenException("Invalid file key");
  }
  await validateS3File(fileKey, {
    allowedTypes: ALLOWED_TYPES["avatar"],
    maxFileSize: MAX_FILE_SIZE["avatar"],
  });
  const user = await User.findById(userId).exec();
  const oldAvatarKey = user.avatar;

  user.avatar = fileKey;
  await user.save();

  if (oldAvatarKey) {
    try {
      await deleteObject(oldAvatarKey);
    } catch (e) {
      logger.warn("Failed to delete old avatar", {
        oldAvatarKey,
        error: e.message,
      });
    }
  }

  let avatar = fileKey;
  if (config.CLOUDFRONT_DOMAIN) {
    avatar = `${config.CLOUDFRONT_DOMAIN}/${avatar}`;
  }
  res.json({
    success: true,
    data: { avatar },
  });
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
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  if (user.accountType !== "user") {
    throw new BadRequestException("Invalid account type");
  }
  if (user.deleteAt) {
    throw new BadRequestException("User is already deleted");
  }

  user.deleteAt = new Date();
  await user.save();

  logger.info("User soft deleted", {
    userId: user._id,
    operator: req.user.userId,
  });

  res.json({
    success: true,
    message: "user soft deleted",
  });
};

const restoreUser = async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    deleteAt: { $ne: null },
  });

  if (!user) {
    throw new NotFoundException("Deleted user not found");
  }
  user.deleteAt = null;
  await user.save();

  logger.info("User restored", { userId: user._id, operator: req.user.userId });

  res.json({
    success: true,
    message: "user restored",
  });
};

module.exports = {
  getMe,
  updateMe,
  updateMyPassword,
  deleteUser,
  restoreUser,
  updateAvatar,
};
