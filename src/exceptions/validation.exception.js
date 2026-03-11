const AppException = require("./app.exception");

class ValidationException extends AppException {
  constructor(message = "Vlidation failed", context = {}) {
    super(400, message, context);
  }
}

module.exports = ValidationException;
