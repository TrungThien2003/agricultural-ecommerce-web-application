const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderStatusSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);
const OrderStatus = mongoose.model("OrderStatus", orderStatusSchema);
module.exports = OrderStatus;
