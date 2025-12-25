const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const typeOfAgriProductSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    profitMargin: { type: Number, default: 0.1 },
    image: String,
    isActive: { type: Boolean, default: true },
    parentType: {
      type: Schema.Types.ObjectId,
      ref: "TypeOfAgriProduct",
      default: null,
    },
  },
  { timestamps: true }
);

const TypeOfAgriProduct = mongoose.model(
  "TypeOfAgriProduct",
  typeOfAgriProductSchema
);
module.exports = TypeOfAgriProduct;
