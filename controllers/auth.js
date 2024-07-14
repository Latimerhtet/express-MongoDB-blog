const bcrypt = require("bcryptjs");
const User = require("../models/user");

// render login page
exports.getLoginPage = (req, res) => {
  res.render("auth/login", { title: "Login" });
};

// handle login action
exports.postLoginForm = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLogin = true;
            req.session.userInfo = user;
            return req.session.save((err) => {
              res.redirect("/");
              console.log(err);
            });
          }
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

// handle logout action
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

// render register page
exports.getRegisterPage = (req, res) => {
  res.render("auth/register", { title: "Register" });
};

exports.registerAccount = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return res.redirect("login");
      }
      return bcrypt
        .hash(password, 10)
        .then((hashPassword) => {
          return User.create({ email, password: hashPassword });
        })
        .then(() => {
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};
