const express = require("express");

const {deleteController} = require("./delete.controller");
const {getController} = require("./get.controller");
const {patchController} = require("./patch.controller");
const {postController} = require("./post.controller");

const router = express.Router();

router.route("/")
  .delete(deleteController)
  .get(getController)
  .patch(patchController)
  .post(postController);

exports.homeRouter = router;
