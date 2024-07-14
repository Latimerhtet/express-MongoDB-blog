const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth");
router.get("/login", authController.getLoginPage);
router.get("/register", authController.getRegisterPage);
router.post("/login", authController.postLoginForm);
router.post("/logout", authController.logout);
router.post("/register", authController.registerAccount);
module.exports = router;
