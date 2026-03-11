const ConflictException = require("../exceptions/conflict.exception");
const User = require("../users/user.model");
const { signAccessToken } = require("../utils/jwt");
const logger = require("../utils/logger");
const { hashPassword, comparePassword } = require("../utils/password");
const UnauthorizedException = require("../exceptions/unauthorized.exception");

const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  const existingUser = await User.findOne({ email }).exec();
  if (existingUser) {
    throw new ConflictException("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ fullName, email, password: hashedPassword });

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

module.exports = {
  login,
  register,
};
