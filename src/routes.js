const { Router } = require("express");
const authRouter = require("./auth/auth.routes");
const userRouter = require("./users/user.routes");

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);

module.exports = v1Router;
