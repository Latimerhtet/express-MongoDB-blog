const express = require("express");
const postControllers = require("../controllers/post");
const router = express.Router();

router.get("/addPost", postControllers.renderAddPostPage);
router.post("/", postControllers.createPost);
module.exports = router;
