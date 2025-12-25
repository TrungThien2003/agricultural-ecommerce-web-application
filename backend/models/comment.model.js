const mongoose = require("mongoose");
const { Schema } = mongoose;
const AgriProduct = require("./agriProduct.model");

// Schema con cho phần phản hồi của Admin
const replySchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Bắt buộc phải có ID người trả lời
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Bạn có thể thêm 'isEdited' nếu muốn tracking việc chỉnh sửa
  },
  { timestamps: true } // Tự động tạo createdAt cho câu trả lời
);

const commentSchema = new Schema(
  {
    // --- PHẦN CỦA NGƯỜI MUA ---
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "AgriProduct",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{ type: String }],

    replies: [replySchema],

    isHidden: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

commentSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isHidden: false } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        totalStars: { $sum: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await AgriProduct.findByIdAndUpdate(productId, {
      voteNumbers: stats[0].nRating,
      totalRatingStars: stats[0].totalStars,
    });
  } else {
    await AgriProduct.findByIdAndUpdate(productId, {
      voteNumbers: 0,
      totalRatingStars: 0,
    });
  }
};

commentSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.product);
});
commentSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.product);
});

module.exports = mongoose.model("Comment", commentSchema);
