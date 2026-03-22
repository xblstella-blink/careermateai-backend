const { includes } = require("zod");
const BadRequestException = require("../exceptions/badRequest.exception");
const {
  generatePresignedUpload,
  generatePresignedGetUrl,
} = require("../utils/s3");
const { ALLOWED_TYPES, MAX_FILE_SIZE, EXTENSION_MAP } = require("./constants");
const crypto = require("crypto");
const ForbiddenException = require("../exceptions/forbidden.exception");

const getPresignedUploadUrl = async (req, res) => {
  const { contentType, category } = req.body;

  const allowedTypes = ALLOWED_TYPES[category];
  if (!allowedTypes.includes(contentType)) {
    throw new BadRequestException("File type is not allowed");
  }
  const maxFileSize = MAX_FILE_SIZE[category];
  const ext = EXTENSION_MAP[contentType] || "";
  const fileKey = `${category}/${req.user.userId}/${crypto.randomUUID()}/${ext}`;

  const { url, fields, expireIn } = await generatePresignedUpload(
    fileKey,
    contentType,
    maxFileSize,
  );

  logger.info("Presinged upload URL generated, {useId, category, fileKey}");

  res.json({
    success: true,
    data: {
      url,
      fields,
      fileKey,
      maxFileSize,
      expireIn,
    },
  });
};

const getPresignedDownloadUrl = async (req, res) => {
  const { key } = req.query;
  const userId = req.user.userId;

  const parts = key.split("/");
  if (
    parts.length !== 3 ||
    !["avatar", "resume"].includes(parts[0]) ||
    parts[1] !== userId
  ) {
    throw new ForbiddenException("No access permission");
  }
  const { url: downloadUrl, expireIn } = await generatePresignedGetUrl(key);
  res.json({
    success: true,
    data: { downloadUrl, expireIn },
  });
};

module.exports = {
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
};
