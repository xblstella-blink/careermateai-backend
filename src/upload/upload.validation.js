const { z } = require("zod");

const presignedUploadSchema = z.object({
  fileNme: z.string().min(1),
  contentType: z.string().min(1),
  category: z.enum(["avatar", "resume"]),
});

const presignedDownloadSchema = z.object({
  key: z.string().min(1),
});

module.exports = {
  presignedDownloadSchema,
  presignedUploadSchema,
};
