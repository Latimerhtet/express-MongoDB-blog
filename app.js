const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

// set view engines for ejs
app.set("view engine", "ejs");
app.set("views", "views");

//routes import
const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
const { mongodbConnector } = require("./util/database");

// allow static files for CSS
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

// middleware
app.use("/", (req, res, next) => {
  console.log("Requested!!");
  next();
});
app.use("/admin/addPost", (req, res, next) => {
  console.log("Requested Add post");
  next();
});

// routes
app.use(postRoutes);
app.use("/admin", adminRoutes);

// connecting mongodb
mongodbConnector();

app.listen(8000);
