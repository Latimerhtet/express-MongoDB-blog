const express = require("express");

const router = express.Router();
const postControllers = require("../controllers/post");
const { isPremium } = require("../middleware/is-premium");
router.get("/", postControllers.getPosts);
router.get("/post/:postId", postControllers.getPost);
router.get("/save/:postId", isPremium, postControllers.savePost);
module.exports = router;
