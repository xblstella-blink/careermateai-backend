const ForbiddenException = require("../exceptions/forbidden.exception");

const roleGuard =
  (...allowedAccountTypes) =>
  (req, res, next) => {
    if (!req.user || !allowedAccountTypes.includes(req.user.accountType)) {
      throw new ForbiddenException("Insufficient permissions");
    }
    next();
  };

module.exports = {
  roleGuard,
};
