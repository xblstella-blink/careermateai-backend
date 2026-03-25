const { Router } = require("express");
const authGuard = require("../middleware/authGuard.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createResumeSchema } = require("./resume.validation");
const resumeController = require("./resume.controller");

const resumeRouter = Router();

resumeRouter.use(authGuard);

resumeRouter.post(
  "/",
  validate(createResumeSchema),
  resumeController.createResume,
);

resumeRouter.get("/", resumeController.getResumes);
resumeRouter.get("/:id", resumeController.downloadResume);
resumeRouter.delete("/:id", resumeController.deleteResume);

module.exports = resumeRouter;
