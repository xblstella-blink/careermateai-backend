const ForbiddenException = require("../exceptions/forbidden.exception");
const {
  validateS3File,
  generatePresignedGetUrl,
  deleteObject,
} = require("../utils/s3");
const { ALLOWED_TYPES, MAX_FILE_SIZE } = require("../upload/constants");
const logger = require("../utils/logger");
const Resume = require("./resume.model");
const NotFoundException = require("../exceptions/notFound.exception");

const createResume = async (req, res) => {
  const { fileKey, fileName } = req.body;

  const userId = req.user.userId;

  if (!fileKey.startsWith(`resume/${userId}/`)) {
    throw new ForbiddenException("File key does not belong to the user");
  }

  const head = await validateS3File(fileKey, {
    allowedTypes: ALLOWED_TYPES["resume"],
    maxFileSize: MAX_FILE_SIZE["resume"],
  });

  const resume = await Resume.create({
    user: userId,
    fileKey,
    fileName,
    fileSize: head.ContentLength,
  });

  logger.info("Resume created", { resumeId: resume._id, userId });
  res.status(201).json({ success: true, data: resume });
};

const getResumes = async (req, res) => {
  const userId = req.user.userId;
  const resumes = await Resume.find({ user: userId })
    .sort({ createdAt: -1 })
    .exec();
  res.json({
    success: true,
    data: resumes,
  });
};

const downloadResume = async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  const userId = req.user.userId;
  if (!resume) {
    throw new NotFoundException("Resume is not found");
  }
  if (resume.user.toString() !== userId) {
    throw new ForbiddenException("Access denied");
  }

  const data = await generatePresignedGetUrl(resume.fileKey);
  res.json({ success: true, data });
};

const deleteResume = async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  const userId = req.user.id;
  if (!resume) {
    throw new NotFoundException("Resume not found");
  }
  if (resume.user.toString() !== userId) {
    throw new ForbiddenException("Access denied");
  }

  await resume.deleteOne();
  await deleteObject(resume.fileKey);

  logger.info("Resume deleted", { resumeId: resume._id, userId });
  res.json({
    success: true,
    message: "Resume deleted",
  });
};

module.exports = {
  getResumes,
  downloadResume,
  deleteResume,
  createResume,
};
