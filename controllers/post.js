const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { formatISO } = require("date-fns");
const imageFileDelete = require("../utils/imagefileDelete");
const PDFDocument = require("pdfkit");
const blobStream = require("blob-stream");
const POST_PER_PAGE = 3;
const fs = require("fs");
const expath = require("path");
// Creating post
exports.createPost = (req, res, next) => {
  const { title, description } = req.body;
  const image = req.file;
  console.log("This is the error for file" + image);
  if (image === undefined) {
    return res.status(422).render("addPost", {
      title: "Add Post",
      errorMessage: "Image file must be types of jpeg, jpg or png.",
      oldData: { title, description },
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("addPost", {
      title: "Add Post",
      errorMessage: errors.array()[0].msg,
      oldData: { title, description },
    });
  }
  Post.create({
    title,
    description,
    imageUrl: image.path,
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

// rendering add post page
exports.renderAddPostPage = (req, res, next) => {
  return res.render("addPost", {
    title: "Add Post",
    errorMessage: "",
    oldData: { title: "", description: "", imageUrl: "" },
  });
};

// rendering home page with all the posts
exports.getPosts = (req, res, next) => {
  // for pagination
  const pageNo = +req.query.page || 1;
  let totalPost;
  Post.find()
    .countDocuments()
    .then((totalPostCount) => {
      totalPost = totalPostCount;
      return Post.find()
        .select("title imageUrl")
        .populate("userId", "email")
        .sort({ createdAt: -1 })
        .skip((pageNo - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE);
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("home", {
          title: "Posts",
          postsArr: posts,
          isLogin: req.session.isLogin ? true : false,
          currentUser: req.session.userInfo ? req.session.userInfo._id : "",
          currentPage: pageNo,
          hasNextPage: POST_PER_PAGE * pageNo < totalPost,
          hasPreviousPage: pageNo > 1,
          nextPage: pageNo + 1,
          previousPage: pageNo - 1,
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

// rendering post detail page
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

// rendering editing post page
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

// editing post function
exports.editPost = (req, res, next) => {
  const { title, description, postId } = req.body;
  const image = req.file;
  // if (image === undefined) {
  //   return res.status(422).render("editPost", {
  //     title,
  //     postId,
  //     oldData: { title, description },
  //     errorMessage: "Image file must be types of jpeg, jpg or png.",
  //     isValidationFail: true,
  //   });
  // }
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
      if (image) {
        imageFileDelete(post.imageUrl);
        post.imageUrl = image.path;
      }
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

// deleting post function
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      imageFileDelete(post.imageUrl);
      return Post.deleteOne({ _id: postId, userId: req.user._id });
    })
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

//saving file as pdf
exports.savePost = (req, res, next) => {
  const id = req.params.postId;
  let postData = {};
  Post.findById(id)
    .populate("userId", "email")
    .lean()
    .then((post) => {
      const date = new Date();
      const outputFilePath = `${expath.join(
        __dirname,
        "../public/pdf",
        date.getTime() + ".pdf"
      )}`;
      // console.log("This is post Data", postData);
      const doc = new PDFDocument({ font: "Courier", size: "A4" });
      const stream = doc.pipe(blobStream());
      doc.pipe(fs.createWriteStream(outputFilePath));
      doc.fontSize(10).text(post.title, { align: "left" });
      doc.moveDown();
      doc
        .image(`${expath.join(__dirname, "../", post.imageUrl)}`, 320, 145, {
          width: 200,
          height: 100,
        })
        .text("Stretch", 320, 130);
      doc.fontSize(8).text(post.description, { align: "center" });
      doc.end();
      // stream.on("finish", () => {
      //   iframe.src = stream.toBlobURL("application/pdf");
      // });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong with downloading post");
      return next(error);
    });

  // stream.on("finish", () => {
  //   iframe.src = stream.toBlobURL("application/pdf");
  // });
  // console.log(err);
  // const error = new Error("Something went wrong with downloading post");
  // return next(error);
};
