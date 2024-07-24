const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { formatISO } = require("date-fns");
exports.createPost = (req, res, next) => {
  const { title, description, imageUrl } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("addPost", {
      title: "Add Post",
      errorMessage: errors.array()[0].msg,
      oldData: { title, description, imageUrl },
    });
  }
  Post.create({
    title,
    description,
    imageUrl,
    userId: req.user,
  })
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.renderAddPostPage = (req, res, next) => {
  return res.render("addPost", {
    title: "Add Post",
    errorMessage: "",
    oldData: { title: "", description: "", imageUrl: "" },
  });
};

exports.getPosts = (req, res, next) => {
  Post.find()
    .select("title imageUrl")
    .populate("userId", "email")
    .sort({ title: -1 })
    .then((posts) => {
      console.log(posts);
      res.render("home", {
        title: "Posts",
        postsArr: posts,
        isLogin: req.session.isLogin ? true : false,
        currentUser: req.session.userInfo ? req.session.userInfo.email : "",
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  const isLogin = req.session.isLogin ? true : false;
  Post.findById(postId)
    .populate("userId", "email")
    .then((post) => {
      console.log(post);
      res.render("postDetail", {
        title: post.title,
        post,
        isLogin,
        currentUserId: req.session.userInfo ? req.session.userInfo._id : "",
        time: post.createdAt
          ? formatISO(post.createdAt, { representation: "date" })
          : undefined,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("The post with the given ID is not found");
      return next(error);
    });
};

exports.getEditPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      res.render("editPost", {
        title: post.title,
        postId: undefined,
        post,
        errorMessage: "",
        oldData: {
          title: undefined,
          description: undefined,
          imageUrl: undefined,
        },
        isValidationFail: false,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong with editing post");
      return next(error);
    });
};

exports.editPost = (req, res, next) => {
  const { title, description, imageUrl, postId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("editPost", {
      title,
      postId,
      oldData: { title, description, imageUrl },
      errorMessage: errors.array()[0].msg,
      isValidationFail: true,
    });
  }
  Post.findById(postId)
    .then((post) => {
      if (post.userId.toString() !== req.session.userInfo._id.toString()) {
        return res.redirect("/");
      }
      post.title = title;
      post.description = description;
      post.imageUrl = imageUrl;
      return post.save().then((result) => {
        console.log("Post updated!");
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong with editing post");
      return next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.deleteOne({ _id: postId, userId: req.user._id })
    .then(() => {
      console.log("post deleted");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong with deleting post");
      return next(error);
    });
};
