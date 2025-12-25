const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const providerSchema = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", providerSchema);
module.exports = Provider;
