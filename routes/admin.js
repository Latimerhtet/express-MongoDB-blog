const express = require("express");
const postControllers = require("../controllers/post");
const router = express.Router();
const { body } = require("express-validator");
router.get("/addPost", postControllers.renderAddPostPage);
router.post(
  "/",
  [
    body("title")
      .isLength({ min: 10 })
      .withMessage("Title should have at least 10 letters"),
    body("imageUrl").isURL().withMessage("Image must be a url"),
    body("description")
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters"),
  ],
  postControllers.createPost
);

router.get("/edit/:postId", postControllers.getEditPost);
router.post(
  "/editPost",
  [
    body("title")
      .isLength({ min: 10 })
      .withMessage("Title should have at least 10 letters"),
    body("imageUrl").isURL().withMessage("Image must be a url"),
    body("description")
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters"),
  ],
  postControllers.editPost
);

router.post("/delete/:postId", postControllers.deletePost);
module.exports = router;
