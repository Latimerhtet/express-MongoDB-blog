const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();
// set view engines for ejs
app.set("view engine", "ejs");
app.set("views", "views");

//routes import
const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
const { error } = require("console");

// allow static files for CSS
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

// routes
app.use(postRoutes);
app.use("/admin", adminRoutes);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(8000);
    console.log("connected to mongoDb");
  })
  .catch((err) => console.log(err));
