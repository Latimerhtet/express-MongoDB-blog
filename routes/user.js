const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");

router.get("/profile/:userId", userController.getPublicProfile);

module.exports = router;
