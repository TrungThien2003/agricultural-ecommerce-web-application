const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const standardOfProductSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
});

const StandardOfProduct = mongoose.model(
  "StandardOfProduct",
  standardOfProductSchema
);
module.exports = StandardOfProduct;
