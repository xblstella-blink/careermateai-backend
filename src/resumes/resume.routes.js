const { Router } = require("express");
const authGuard = require("../middleware/authGuard.middleware");
const { validate } = require("./resume.model");
const { createResumeSchema } = require("./resume.validation");
const resumeController = require("./resume.controller");

const resumeRouter = Router();

resumeRouter.use(authGuard);

resumeRouter.posh(
  "/",
  validate(createResumeSchema),
  resumeController.createResume,
);

resumeRouter.get("/", resumeController.getResumes);
resumeRouter.get("/:id", resumeController.downloadResume);
resumeRouter.delete("/:id", resumeController.deleteResume);

module.exports = resumeRouter;
