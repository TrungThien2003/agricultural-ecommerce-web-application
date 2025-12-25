const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartItemSchema = new Schema(
  {
    cart: { type: Schema.Types.ObjectId, ref: "Cart" },

    //Liên kết tới GoodsReceivedDetail (batch), thay vì AgriProduct
    batch: { type: Schema.Types.ObjectId, ref: "GoodsReceivedDetail" },
    quantity: Number,
  },
  { timestamps: true }
);
const CartItem = mongoose.model("CartItem", cartItemSchema);
module.exports = CartItem;
