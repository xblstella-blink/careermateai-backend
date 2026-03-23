const { Router } = require("express");
const authRouter = require("./auth/auth.routes");
const userRouter = require("./users/user.routes");
const uploadRouter = require("./upload/upload.routes");
const resumeRouter = require("./resumes/resume.routes");

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/upload", uploadRouter);
v1Router.use("/resumes", resumeRouter);

module.exports = v1Router;
