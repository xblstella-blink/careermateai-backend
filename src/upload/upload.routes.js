const { Router } = require("express");
const {
  validate,
  validateQuery,
} = require("../middleware/validation.middleware");
const authGuard = require("../middleware/authGuard.middleware");
const uploadController = require("./upload.controller");
const {
  presignedUploadSchema,
  presignedDownloadSchema,
} = require("./upload.validation");

const uploadRouter = Router();
uploadRouter.use(authGuard);

uploadRouter.post(
  "/presigned-url",
  validate(presignedUploadSchema),
  uploadController.getPresignedUploadUrl,
);

uploadRouter.get(
  "/presigned-url",
  validateQuery(presignedDownloadSchema),
  uploadController.getPresignedDownloadUrl,
);

module.exports = uploadRouter;
