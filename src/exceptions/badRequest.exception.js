const AppException = require("./app.exception");

class badRequestException extends AppException {
  constructor(message = "Bad request", context = {}) {
    super(400, message, context);
  }
}

module.exports = badRequestException;
