const Post = require("../models/post");

exports.createPost = (req, res) => {
  const { title, description, imageUrl } = req.body;
  const post = new Post(title, description, imageUrl);
  post
    .create()
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
  Post.getPosts()
    .then((posts) => {
      res.render("home", { title: "Posts", postsArr: posts });
    })
    .catch((err) => console.log(err));
};

exports.getPost = (req, res) => {
  const postId = req.params.postId;
  Post.getPost(postId)
    .then((post) => {
      res.render("postDetail", { title: post.title, post });
    })
    .catch((err) => console.log(err));
};

exports.getEditPost = (req, res) => {
  const postId = req.params.postId;
  Post.getPost(postId)
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
  const post = new Post(title, description, imageUrl, postId);
  post
    .create()
    .then((result) => {
      console.log("Post updated!");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.deletePost = (req, res) => {
  const postId = req.params.postId;

  Post.deletePost(postId)
    .then(() => {
      console.log("post deleted");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
