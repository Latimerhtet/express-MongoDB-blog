const mongodb = require("mongodb");
const { getDatabase } = require("../util/database");

class Post {
  constructor(title, description, imageUrl) {
    (this.title = title),
      (this.description = description),
      (this.imageUrl = imageUrl);
  }
  create() {
    const db = getDatabase();
    return db
      .collection("posts")
      .insertOne(this)
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }

  static getPosts() {
    const db = getDatabase();
    return db
      .collection("posts")
      .find()
      .toArray()
      .then((posts) => {
        console.log(posts);
        return posts;
      })
      .catch((err) => console.log(err));
  }

  static getPost(postId) {
    const db = getDatabase();
    return db
      .collection("posts")
      .find({ _id: new mongodb.ObjectId(postId) })
      .next()
      .then((post) => {
        console.log(post);
        return post;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Post;
