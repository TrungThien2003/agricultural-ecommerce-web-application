const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const typeOfPaymentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);
const TypeOfPayment = mongoose.model("TypeOfPayment", typeOfPaymentSchema);
module.exports = TypeOfPayment;
