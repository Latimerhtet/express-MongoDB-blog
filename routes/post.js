const express = require("express");

const router = express.Router();

router.use("/", (req, res) => {
  res.render("home", { title: "Posts" });
});

module.exports = router;
