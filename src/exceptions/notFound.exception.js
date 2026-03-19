const AppException = require("./app.exception");

class NotFoundException extends AppException {
  constructor(message = "Resource not found", context = {}) {
    super(404, message, context);
  }
}

module.exports = NotFoundException;
