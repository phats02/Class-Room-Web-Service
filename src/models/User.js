const mongoose = require("mongoose");
//const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const User = new Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    // for admin login
    password: {
      type: String,
    },
    name: {
      type: String,
    },
    student: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    status: {
      type: Number,
      default: 1, // 0: inactive, 1: active
    },
    type: {
      type: Number,
      default: 1, // 0: Admin | 1: User
    },
    forgotPasswordCode: {
      type: String,
    },
    activationCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
