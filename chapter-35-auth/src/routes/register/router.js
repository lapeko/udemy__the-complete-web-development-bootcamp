const {Router} = require("express");

const {getController} = require("./get.controller");
const {postController} = require("./post.controller");

const router = Router();

router.route("/")
  .get(getController)
  .post(postController);

exports.registerRouter = router;