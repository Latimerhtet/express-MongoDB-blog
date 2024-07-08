const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.set("views", "views");
const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", (req, res, next) => {
  console.log("Requested!!");
  next();
});
app.use("/admin/addPost", (req, res, next) => {
  console.log("Requested Add post");
  res.render("addPost", { title: "Add Post" });
  next();
});

app.use(postRoutes);
app.use("/admin", adminRoutes);
app.listen(8000);
