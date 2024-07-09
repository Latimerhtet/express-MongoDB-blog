const express = require("express");
const postControllers = require("../controllers/post");
const router = express.Router();

router.get("/addPost", postControllers.renderAddPostPage);
router.post("/", postControllers.createPost);

router.get("/edit/:postId", postControllers.getEditPost);
router.post("/editPost", postControllers.editPost);

router.post("/delete/:postId", postControllers.deletePost);
module.exports = router;
