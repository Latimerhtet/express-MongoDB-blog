const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth");
router.get("/login", authController.getLoginPage);
router.get("/register", authController.getRegisterPage);
router.post("/login", authController.postLoginForm);
router.post("/logout", authController.logout);
router.post("/register", authController.registerAccount);
router.get("/resetPassword", authController.getResetPage);
router.get("/feedback", authController.getFeedbackPage);
router.post("/reset", authController.resetLinkSending);
router.get("/resetPassword/:token", authController.getNewPasswordPage);
router.post("/changeNewPassword", authController.changeNewPassword);
module.exports = router;
