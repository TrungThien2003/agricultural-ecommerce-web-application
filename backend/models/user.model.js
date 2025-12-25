const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: String,
  email: String,
  password: String,
  address: String,
  isAdmin: { type: Boolean, default: false },
  isDeleted: Boolean,
});
const User = mongoose.model("User", userSchema);
module.exports = User;
