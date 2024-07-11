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
    .populate("userId", "username")
    .sort({ title: -1 })
    .then((posts) => {
      console.log(posts);
      res.render("home", { title: "Posts", postsArr: posts });
    })
    .catch((err) => console.log(err));
};

exports.getPost = (req, res) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      res.render("postDetail", { title: post.title, post });
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
      post.title = title;
      post.description = description;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      console.log("Post updated!");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.deletePost = (req, res) => {
  const postId = req.params.postId;

  Post.findByIdAndDelete(postId)
    .then(() => {
      console.log("post deleted");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
