const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [{ type: Schema.Types.ObjectId, ref: "CartItem" }],
});
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
