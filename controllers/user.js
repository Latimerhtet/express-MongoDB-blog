const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const POST_PER_PAGE = 3;

// get user profile
exports.getprofile = (req, res, next) => {
  const pageNo = +req.query.page || 1;
  let totalPost;
  Post.find({ userId: req.user._id })
    .countDocuments()
    .then((totalPostCount) => {
      totalPost = totalPostCount;
      return Post.find({ userId: req.user._id })
        .populate("userId", "email username")
        .sort({ createdAt: -1 })
        .skip((pageNo - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE);
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/profile", {
          title: "Profile",
          postsArr: posts,
          isLogin: req.session.isLogin ? true : false,
          currentPage: pageNo,
          hasNextPage: POST_PER_PAGE * pageNo < totalPost,
          hasPreviousPage: pageNo > 1,
          nextPage: pageNo + 1,
          previousPage: pageNo - 1,
          currentUser: req.session.userInfo ? req.session.userInfo.email : null,
        });
      } else {
        return res.status(422).render("errors/404", {
          title: "Posts not found",
          errorMessage: "Unvalid page Number!",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

// getting the profile of a user
exports.getPublicProfile = (req, res, next) => {
  const userId = req.params.userId;
  const pageNo = +req.query.page || 1;
  let totalPost;
  Post.find({ userId })
    .countDocuments()
    .then((totalPostCount) => {
      totalPost = totalPostCount;
      return Post.find({ userId })
        .populate("userId", "email")
        .sort({ createdAt: -1 })
        .skip((pageNo - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE);
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/publicProfile", {
          title: "Profile",
          postsArr: posts,
          isLogin: req.session.isLogin ? true : false,
          currentPage: pageNo,
          hasNextPage: POST_PER_PAGE * pageNo < totalPost,
          hasPreviousPage: pageNo > 1,
          nextPage: pageNo + 1,
          previousPage: pageNo - 1,
          currentUser: posts[0].userId.email,
        });
      } else {
        return res.status(422).render("errors/404", {
          title: "Posts not found",
          errorMessage: "Unvalid page Number!",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.renderSetUsernamePage = (req, res, next) => {
  let message = req.flash("resetErr");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("user/userName", {
    title: "Set UserName",
    errorMessage: message,
    oldData: "",
  });
};

// setting username
exports.setUserName = (req, res, next) => {
  const { username } = req.body;
  const updatedUsername = username.replace("@", "");
  console.log(updatedUsername);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/userName", {
      title: "Set Username",
      errorMessage: errors.array()[0].msg,
      oldData: { username },
    });
  }
  User.findById(req.user._id)
    .then((user) => {
      user.username = `@${updatedUsername}`;
      user.save().then(() => {
        console.log("Username updated!!");
        res.redirect("/admin/profile");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

//render premium page

exports.renderPremiumPage = (req, res, next) => {
  res.render("user/premium", {
    title: "Premium subscription",
  });
};
