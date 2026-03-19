const UnauthorizedException = require("../exceptions/unauthorized.exception");
const { verifyAccessToken } = require("../utils/jwt");

const authGuard = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthorizedException("Authentication required");
  }

  const token = authHeader.split(" ")[1];
  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (e) {
    throw new UnauthorizedException("Invalid or expired token");
  }
};

module.exports = authGuard;
