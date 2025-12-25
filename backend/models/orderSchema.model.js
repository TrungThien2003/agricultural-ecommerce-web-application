// src/models/orderModel.js (SỬA LẠI)
const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    orderDate: { type: Date, default: Date.now },
    total: Number,
    isPaid: { type: Boolean, default: false },

    paymentType: {
      type: String,
      enum: ["cod", "vnpay"],
      default: "cod",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    paymentRef: { type: String }, // Lưu tham chiếu thanh toán từ VNPay nếu có

    // --- THÊM CÁC TRƯỜNG NÀY ---
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerNote: { type: String },
    // ---------------------------

    orderItems: [{ type: Schema.Types.ObjectId, ref: "OrderDetail" }],
  },
  { timestamps: true }
);
// ... (export)
module.exports = mongoose.model("Order", orderSchema);
