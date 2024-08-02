const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const dotenv = require("dotenv").config();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const storageConfigure = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileFilterConfigure = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// set view engines for ejs
app.set("view engine", "ejs");
app.set("views", "views");

//routes import
const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const User = require("./models/user");
const errorPageHandler = require("./controllers/error");

const { isLogin } = require("./middleware/is-login");

// allow static files for CSS
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: storageConfigure, fileFilter: fileFilterConfigure }).single(
    "imageUrl"
  )
);
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
// middleware
app.use(flash());
app.use((req, res, next) => {
  if (req.session.isLogin === undefined) {
    return next();
  }
  User.findById(req.session.userInfo._id)
    .select("_id email")
    .then((user) => {
      req.user = user;
      next();
    });
});
app.use((req, res, next) => {
  res.locals.isLogin = req.session.isLogin ? true : false;
  next();
});
// routes

app.use(postRoutes);
app.use("/admin", isLogin, adminRoutes);
app.use(userRoutes);
app.use(authRoutes);

app.all("*", errorPageHandler.get404Page);
app.use(errorPageHandler.get500Page);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(8000);
    console.log("connected to mongoDb");
  })
  .catch((err) => console.log(err));
