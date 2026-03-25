const {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const config = require("./config");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const NotFoundException = require("../exceptions/notFound.exception");
const BadRequestException = require("../exceptions/badRequest.exception");

const s3Client = new S3Client({
  region: config.AWS_REGION,
  maxAttempts: 3,
});

const generatePresignedUpload = async (fileKey, contentType, maxFileSize) => {
  const expiresIn = 300;
  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: config.S3_BUCKET,
    Key: fileKey,
    Conditions: [
      ["content-length-range", 0, maxFileSize],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: {
      "Content-Type": contentType,
    },
    Expires: 300,
  });
  return { url, fields, expiresIn };
};

const generatePresignedGetUrl = async (fileKey) => {
  const expiresIn = 3600;
  const command = new GetObjectCommand({
    Bucket: config.S3_BUCKET,
    Key: fileKey,
  });
  const url = await getSignedUrl(s3Client, command, {
    expiresIn,
  });
  return { url, expiresIn };
};

//get metadata information
const headObject = async (fileKey) => {
  const command = new HeadObjectCommand({
    Bucket: config.S3_BUCKET,
    Key: fileKey,
  });
  return s3Client.send(command);
};

const deleteObject = async (fileKey) => {
  const command = new DeleteObjectCommand({
    Bucket: config.S3_BUCKET,
    Key: fileKey,
  });
  return s3Client.send(command);
};

const getObjectBytes = async (fileKey, bytes = 4096) => {
  const command = new GetObjectCommand({
    Bucket: config.S3_BUCKET,
    Key: fileKey,
    Range: `byte = 0-${bytes - 1}`,
  });
  const response = await s3Client.send(command);
  return Buffer.from(await response.Body.transformToByteArray());
};

const MAGIC_SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
};

const detectMimeType = (buffer) => {
  for (const [mime, sig] of Object.entries(MAGIC_SIGNATURES)) {
    if (sig.every((byte, i) => buffer[i] === byte)) {
      return mime;
    }
  }
  return null;
};

const verifyFileContent = async (fileKey, allowedTypes) => {
  const buffer = await getObjectBytes(fileKey);
  const actualMime = detectMimeType(buffer);
  if (!actualMime || !allowedTypes.includes(actualMime)) {
    return { valid: false, detected: actualMime || "unknown" };
  }
  return { valid: true, detected: actualMime };
};

const validateS3File = async (fileKey, { allowedTypes, maxFileSize }) => {
  let head;
  try {
    head = await headObject(fileKey);
  } catch (error) {
    if (error.name === "NotFound") {
      throw new NotFoundException("File not found in S3");
    }
    throw error;
  }
  if (!allowedTypes.includes(head.ContentType)) {
    throw new BadRequestException(
      `File type ${head.ContentType} is not allowed, allowed types are ${allowedTypes.join(", ")}`,
    );
  }
  if (head.ContentLength > maxFileSize) {
    throw new BadRequestException(`File exceeds max file size: ${maxFileSize}`);
  }

  const { valid, detected } = await verifyFileContent(fileKey, allowedTypes);
  if (!valid) {
    throw new BadRequestException(
      `File content does not match declared types. Detected ${detected}`,
    );
  }
  return head;
};

module.exports = {
  generatePresignedGetUrl,
  generatePresignedUpload,
  headObject,
  deleteObject,
  validateS3File,
};
