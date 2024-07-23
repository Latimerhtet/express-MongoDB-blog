const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
// render login page
router.get("/login", authController.getLoginPage);

// render register page
router.get("/register", authController.getRegisterPage);

// taking action for login form
router.post(
  "/login",
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must have at least 4 characters"),
  authController.postLoginForm
);

// taking action for logout form
router.post("/logout", authController.logout);

// taking action for registering account
router.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address!")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(
            "Email is already existed! Please enter a new one"
          );
        }
      });
    }),
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must be at least 4 characters"),
  authController.registerAccount
);

// rendering reset password page
router.get("/resetPassword", authController.getResetPage);

// rendering feedback page
router.get("/feedback", authController.getFeedbackPage);

// taking action for sending reset link from email
router.post(
  "/reset",
  body("email").isEmail().withMessage("Please Enter a valid email"),
  authController.resetLinkSending
);

// rendering new password page
router.get("/resetPassword/:token", authController.getNewPasswordPage);

// taking action for changing password
router.post(
  "/changeNewPassword",
  body("newPassword")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 characters"),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password and new password must be the same!");
      }
      return true;
    }),
  authController.changeNewPassword
);

module.exports = router;
