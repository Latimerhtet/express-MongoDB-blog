const express = require("express");
const postControllers = require("../controllers/post");
const userProfileControllers = require("../controllers/user");
const router = express.Router();
const { body } = require("express-validator");
const { isPremium } = require("../middleware/is-premium");
router.get("/addPost", postControllers.renderAddPostPage);
router.post(
  "/",
  [
    body("title")
      .isLength({ min: 10 })
      .withMessage("Title should have at least 10 letters"),
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
    body("description")
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters"),
  ],
  postControllers.editPost
);

router.post("/delete/:postId", postControllers.deletePost);

router.get("/profile", userProfileControllers.getprofile);

router.get("/username", userProfileControllers.renderSetUsernamePage);

router.post(
  "/setUserName",
  body("username")
    .isLength({ min: 3 })
    .withMessage("username must have at least 3 letters"),
  userProfileControllers.setUserName
);

router.get("/premium", userProfileControllers.renderPremiumPage);

router.get("/subscription-success", userProfileControllers.getSuccessfulPage);

router.get("/premium-details", userProfileControllers.getPremiumDetails);

router.get(
  "/upload-image",
  isPremium,
  userProfileControllers.getprofileuploadPage
);

router.post("/setProfile", isPremium, userProfileControllers.setProileImg);
module.exports = router;
