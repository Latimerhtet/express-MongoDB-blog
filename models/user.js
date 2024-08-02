const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    unique: true,
    required: true,
    minLength: 4,
  },
  username: {
    type: String,
    unique: true,
    minLength: 3,
  },
  resetToken: String,
  tokenExpiration: Date,
});

module.exports = model("User", userSchema);
