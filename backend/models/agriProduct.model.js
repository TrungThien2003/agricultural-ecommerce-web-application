const mongoose = require("mongoose");

const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: "" },
    weight: { type: Number, default: null },
    averageCost: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    nearestExpiryDate: { type: Date, default: null },
    nearestHarvestDate: { type: Date, default: null },
  },
  { _id: true }
);

const agriProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: "" },
    storageCondition: String,
    provinceOfOrigin: String,
    description: String,
    totalRatingStars: { type: Number, default: null },
    voteNumbers: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    weight: { type: Number, default: null },
    harvestSeason: [
      {
        min: { type: Number, min: 1, max: 12 },
        max: { type: Number, min: 1, max: 12 },
      },
    ],

    //Ảnh sản phẩm
    images: [{ type: String }],
    variants: [variantSchema],
    nearestExpiryDate: { type: Date, default: null },
    nearestHarvestDate: { type: Date, default: null },

    //Quan hệ
    type: {
      type: Schema.Types.ObjectId,
      ref: "TypeOfAgriProduct",
      required: true,
    },
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    standardOfProduct: {
      type: Schema.Types.ObjectId,
      ref: "StandardOfProduct",
      default: null,
    },
    harvestMethod: {
      type: Schema.Types.ObjectId,
      ref: "Method",
      default: null,
    },

    //Giá trung bình và trạng thái
    averageCost: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Tính điểm trung bình đánh giá
agriProductSchema.virtual("averageRating").get(function () {
  if (!this.voteNumbers || this.voteNumbers === 0) return 0;
  return Math.round((this.totalRatingStars / this.voteNumbers) * 10) / 10;
});

//Giá bán = averageCost + (averageCost * profitMargin)
agriProductSchema.virtual("sellingPrice").get(function () {
  if (!this.averageCost || !this.type || !this.type.profitMargin) return null;
  return Math.round(this.averageCost * (1 + this.type.profitMargin));
});
agriProductSchema.virtual("quantity").get(function () {
  if (!this._quantity) return 0; // fallback
  // Chỉ tính các lô mà variant = null (sản phẩm gốc)
  return this._quantity
    .filter((batch) => !batch.variant)
    .reduce((sum, batch) => sum + (batch.quantityRemaining || 0), 0);
});

agriProductSchema.methods.getVariantQuantity = function (variantId) {
  if (!this._quantity || this._quantity.length === 0) return 0;
  return this._quantity
    .filter((batch) => batch.variant?.toString() === variantId.toString())
    .reduce((sum, batch) => sum + (batch.quantityRemaining || 0), 0);
};

agriProductSchema.virtual("variantsWithQuantity").get(function () {
  if (!this.variants || !this._quantity) return [];

  return this.variants.map((v) => {
    const qty = this._quantity
      .filter((batch) => batch.variant?.toString() === v._id.toString())
      .reduce((sum, batch) => sum + (batch.quantityRemaining || 0), 0);

    return {
      ...v.toObject(),
      quantity: qty,
    };
  });
});
//Tồn kho – tham chiếu từ bảng GoodsReceivedDetail
agriProductSchema.virtual("_quantity", {
  ref: "GoodsReceivedDetail",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  options: { select: "quantityRemaining variant" },
});

//
//Tính tổng tồn kho từ các lô hàng
agriProductSchema.methods.getTotalQuantity = function () {
  if (!this._quantity || this._quantity.length === 0) return 0;
  return this._quantity.reduce(
    (sum, batch) => sum + (batch.quantityRemaining || 0),
    0
  );
};

//Hiển thị mùa vụ dạng chuỗi (VD: "Tháng 4–8, Tháng 10–12")
agriProductSchema.virtual("harvestSeasonDisplay").get(function () {
  if (!this.harvestSeason || this.harvestSeason.length === 0) return "";
  return this.harvestSeason.map((s) => `Tháng ${s.min}–${s.max}`).join(", ");
});

agriProductSchema.virtual("variantsWithPrice").get(function () {
  if (!this.variants) return [];
  return this.variants.map((v) => ({
    ...v.toObject(),
    sellingPrice:
      v.averageCost && this.type?.profitMargin
        ? Math.round(v.averageCost * (1 + this.type.profitMargin))
        : null,
  }));
});

agriProductSchema.pre(/^find/, function (next) {
  this.populate("_quantity");
  next();
});
module.exports =
  mongoose.models.AgriProduct ||
  mongoose.model("AgriProduct", agriProductSchema);
