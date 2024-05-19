const express = require("express");

const {getController} = require("./get.controller");
const {postController} = require("./post.controller");

const router = express.Router();

router.route("/")
  .get(getController)
  .post(postController);

exports.loginRouter = router;
