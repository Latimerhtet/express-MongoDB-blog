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
