const User = require("../users/user.model");
const logger = require("../utils/logger");

const register = async (req, res) => {
  const user = await User.create({ fullName, email, password });

  logger.info("User registered", { userID: user._id });

  res.json({
    success: true,
    data: {
      user,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (user.password !== password) {
    return res.status(401).json({
      sucess: false,
      data: {
        message: "Invalid email or password",
      },
    });
  }

  res.json({
    sucess: true,
    data: {
      user,
    },
  });
};

module.exports = {
  login,
  register,
};
