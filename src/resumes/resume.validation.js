const { z } = require("zod");

const createResumeSchema = z.object({
  fileKey: z.string().min(1),
  fileName: z.string().min(1),
});

module.exports = { createResumeSchema };
