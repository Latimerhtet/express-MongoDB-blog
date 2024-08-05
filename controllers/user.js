const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const user = require("../models/user");
const stripe = require("stripe")(
  "sk_test_51PjYBQP7lSRf3HTJJhQz8O24wpZx8ElShM1eP8Ktcv8bMRI5yXxgOUbs3TgXo9BseWtvu8uuyWqK4sNxWmT2F9eO00XzbWZ87B"
);
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
        .populate("userId", "email username isPremium imgUrl")
        .sort({ createdAt: -1 })
        .skip((pageNo - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE);
    })
    .then((posts) => {
      if (!posts.length && pageNo > 1) {
        return res.status(422).render("errors/404", {
          title: "Posts not found",
          errorMessage: "Unvalid page Number!",
        });
      } else {
        return res.render("user/profile", {
          title: "Profile",
          postsArr: posts ? posts : [],
          isLogin: req.session.isLogin ? true : false,
          currentPage: pageNo,
          hasNextPage: POST_PER_PAGE * pageNo < totalPost,
          hasPreviousPage: pageNo > 1,
          nextPage: pageNo + 1,
          previousPage: pageNo - 1,
          currentUser: req.session.userInfo ? req.session.userInfo.email : null,
          premiumUser: posts[0].userId.isPremium,
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
        .populate("userId", "email username isPremium imgUrl")
        .sort({ createdAt: -1 })
        .skip((pageNo - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE);
    })
    .then((posts) => {
      if (!posts.length && pageNum > 1) {
        return res.status(422).render("errors/404", {
          title: "Posts not found",
          errorMessage: "Unvalid page Number!",
        });
      } else {
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
          currentUserProfile: posts[0].userId.imgUrl,
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
  stripe.checkout.sessions
    .create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1PjZGFP7lSRf3HTJMVVrnhCX",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.protocol}://${req.get(
        "host"
      )}/admin/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get(
        "host"
      )}/admin/subscription-cancel`,
    })
    .then((stripe_session) => {
      res.render("user/premium", {
        title: "Buy premium",
        session_id: stripe_session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

// rendering subscription successful page
exports.getSuccessfulPage = (req, res, next) => {
  const session_id = req.query.session_id;
  console.log(session_id);
  if (!session_id || !session_id.includes("cs_test_")) {
    return res.redirect("/admin/profile");
  }
  User.findById(req.user._id)
    .then((user) => {
      user.isPremium = true;
      user.premium_session_key = session_id;
      return user.save().then(() => {
        res.render("user/subscription-success", {
          title: "Subscription successful!",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.getPremiumDetails = (req, res, next) => {
  user
    .findById(req.user._id)
    .then((user) => {
      return stripe.checkout.sessions.retrieve(user.premium_session_key);
    })
    .then((stripe_sessions) => {
      res.render("user/premiumDetail", {
        title: "Status",
        customer_id: stripe_sessions.customer,
        customer_name: stripe_sessions.customer_details.name,
        customer_email: stripe_sessions.customer_details.email,
        country: stripe_sessions.customer_details.address.country,
        amountTotal: stripe_sessions.amount_total,
        paymentStatus: stripe_sessions.payment_status,
        invoice_id: stripe_sessions.invoice,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

// render profile upload page
exports.getprofileuploadPage = (req, res, next) => {
  let message = req.flash("resetErr");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("user/profileUpload", {
    title: "Upload Profile",
    errorMessage: message,
    oldData: "",
  });
};

exports.setProileImg = (req, res, next) => {
  const image = req.file;
  console.log("This is the error for file" + image);
  if (image === undefined) {
    return res.status(422).render("user/profileUpload", {
      title: "Upload Profile",
      errorMessage: "Image file must be types of jpeg, jpg or png.",
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/profileUpload", {
      title: "Upload Profile",
      errorMessage: errors.array()[0].msg,
    });
  }

  User.findById(req.user._id)
    .then((user) => {
      user.imgUrl = image.path;
      return user.save().then(() => {
        res.redirect("/admin/profile");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};
