const { Route } = require("express");
const authRouter = require("./auth/auth.routes");

const v1Router = Router();

v1Router.use("/auth", authRouter);

module.exports = v1Router;
