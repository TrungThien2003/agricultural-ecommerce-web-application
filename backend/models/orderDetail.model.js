const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderDetailSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order" },

    //Liên kết tới lô hàng, để biết đơn hàng lấy từ batch nào
    batch: { type: Schema.Types.ObjectId, ref: "GoodsReceivedDetail" },

    price: Number, //giá bán tại thời điểm đặt hàng
    quantity: Number,
  },
  { timestamps: true }
);
const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);
module.exports = OrderDetail;
