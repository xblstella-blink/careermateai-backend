const ALLOWED_TYPES = {
  avatar: ["image/jpeg", "image/png"],
  resume: ["application/pdf"],
};

const MAX_FILE_SIZE = {
  avatar: 5 * 1024 * 1024,
  resume: 10 * 1024 * 1024,
};

const EXTENSION_MAP = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
};

module.exports = {
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  EXTENSION_MAP,
};
