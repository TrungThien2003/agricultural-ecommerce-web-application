const mongoose = require("mongoose");
const { Schema } = mongoose;

const goodsReceivedNoteSchema = new Schema(
  {
    provider: { type: Schema.Types.ObjectId, ref: "Provider" },
    dateOfNote: Date,
    totalCost: Number,
    importedBy: { type: Schema.Types.ObjectId, ref: "User" },
    details: [{ type: Schema.Types.ObjectId, ref: "GoodsReceivedDetail" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const GoodsReceivedNote = mongoose.model(
  "GoodsReceivedNote",
  goodsReceivedNoteSchema
);

module.exports = GoodsReceivedNote;
