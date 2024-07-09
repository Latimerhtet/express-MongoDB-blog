const mongodb = require("mongodb");
const { getDatabase } = require("../util/database");

class Post {
  constructor(title, description, imageUrl, id) {
    (this.title = title),
      (this.description = description),
      (this.imageUrl = imageUrl),
      (this._id = id ? new mongodb.ObjectId(id) : null);
  }
  create() {
    const db = getDatabase();
    let dbTemp;
    if (this._id) {
      // update post
      dbTemp = db
        .collection("posts")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      // add post
      dbTemp = db.collection("posts").insertOne(this);
    }
    return dbTemp
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }

  static getPosts() {
    const db = getDatabase();
    return db
      .collection("posts", { locale: "en", casLevel: true })
      .find()
      .sort({ title: 1 })
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

  static deletePost(postId) {
    const db = getDatabase();

    return db
      .collection("posts")
      .deleteOne({ _id: new mongodb.ObjectId(postId) })
      .then((result) => {
        console.log("post deleted");
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Post;
