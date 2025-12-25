const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const methodSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
});

const Method = mongoose.model("Method", methodSchema);
module.exports = Method;
