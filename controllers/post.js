const Post = require("../models/post");

exports.createPost = (req, res) => {
  const { title, description, imageUrl } = req.body;
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
    .catch((err) => console.log(err));
};

exports.renderAddPostPage = (req, res) => {
  res.render("addPost", { title: "Add Post" });
};

exports.getPosts = (req, res) => {
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
    .catch((err) => console.log(err));
};

exports.getPost = (req, res) => {
  const postId = req.params.postId;
  const isLogin = req.session.isLogin ? true : false;
  Post.findById(postId)
    .then((post) => {
      res.render("postDetail", {
        title: post.title,
        post,
        isLogin,
        currentUserId: req.session.userInfo ? req.session.userInfo._id : "",
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditPost = (req, res) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      res.render("editPost", { title: post.title, post });
    })
    .catch((err) => console.log(err));
};

exports.editPost = (req, res) => {
  const { title, description, imageUrl, postId } = req.body;
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
    .catch((err) => console.log(err));
};

exports.deletePost = (req, res) => {
  const postId = req.params.postId;

  Post.deleteOne({ _id: postId, userId: req.user._id })
    .then(() => {
      console.log("post deleted");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
