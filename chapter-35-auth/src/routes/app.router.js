const express = require("express");

const {loginRouter} = require("./login/router");
const {logoutRouter} = require("./logout/router");
const {registerRouter} = require("./register/router");
const {homeRouter} = require("./home/router");

const {authMiddleware: auth} = require("../middlewares/auth.middleware");

const appRouter = express.Router();

appRouter.use("/login", loginRouter);
appRouter.use("/logout", logoutRouter);
appRouter.use("/register", registerRouter);
appRouter.use("/", auth, homeRouter);

module.exports = appRouter;
