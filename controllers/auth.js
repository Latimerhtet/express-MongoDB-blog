const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});
const crypto = require("crypto");
const { validationResult } = require("express-validator");
// render login page
exports.getLoginPage = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(message);
  res.render("auth/login", {
    title: "Login",
    errorMessage: message,
    oldData: { email: "", password: "" },
  });
};

// handle login action
exports.postLoginForm = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      title: "Login",
      errorMessage: errors.array()[0].msg,
      oldData: { email, password },
    });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          title: "Login",
          errorMessage: "Please enter a valid email and password",
          oldData: { email, password },
        });
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
          res.status(422).render("auth/login", {
            title: "Login",
            errorMessage: "Please enter a valid email and password",
            oldData: { email, password },
          });
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
  let message = req.flash("registerMsg");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/register", {
    title: "Register",
    errMessage: message,
    oldData: { email: "", password: "" },
  });
};

// registering an account
exports.registerAccount = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register", {
      title: "Register",
      errMessage: errors.array(),
      oldData: { email, password },
    });
  }
  bcrypt
    .hash(password, 10)
    .then((hashPassword) => {
      return User.create({ email, password: hashPassword });
    })
    .then(() => {
      res.redirect("/login");
      transporter.sendMail({
        from: process.env.SENDER_MAIL,
        to: email,
        subject: "Registration Successful!",
        html: "<h1>Registration of your account is successful!</h1><p>Created an account using this email address in blog.io</p>",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// rendering reset password page
exports.getResetPage = (req, res) => {
  let message = req.flash("resetErr");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    title: "Reset Password",
    errorMessage: message,
    oldData: "",
  });
};
// rendering feedback link
exports.getFeedbackPage = (req, res) => {
  return res.render("auth/feedback", { title: "Account reset feedback" });
};
// resetting link sent
exports.resetLinkSending = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/reset", {
      title: "Reset Password",
      errorMessage: errors.array()[0].msg,
      oldData: email,
    });
  }
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/resetPassword");
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.status(422).render("auth/reset", {
            title: "Reset Password",
            errorMessage: "No account found with this email address",
            oldData: email,
          });
        }
        user.resetToken = token;
        user.tokenExpiration = Date.now() + 1800000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/feedback");
        transporter.sendMail(
          {
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Reset Password!",
            html: `<h1>You can reset your password!</h1><p>You can change your password by clicking the link below!!</p>
          <p><a  href="http://localhost:8000/resetPassword/${token}">Click here</a></p>`,
          },
          (err) => {
            console.log(err);
          }
        );
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPasswordPage = (req, res) => {
  const { token } = req.params;
  console.log(token);
  User.findOne({ resetToken: token, tokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (user) {
        let message = req.flash("resetErr");
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render("auth/newPassword", {
          title: "Change Password",
          errorMessage: message,
          resetToken: token,
          userId: user._id,
          oldData: { newPassword: "", confirmPassword: "" },
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => console.log(err));
};

// changing new password
exports.changeNewPassword = (req, res) => {
  const { newPassword, confirmPassword, resetToken, userId } = req.body;
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/newPassword", {
      title: "Change Password",
      errorMessage: errors.array()[0].msg,
      userId,
      resetToken,
      oldData: { newPassword, confirmPassword },
    });
  }
  let resetUser;
  User.findOne({
    resetToken,
    tokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 10);
    })
    .then((hashPassword) => {
      resetUser.password = hashPassword;
      resetUser.resetToken = undefined;
      resetUser.tokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};
