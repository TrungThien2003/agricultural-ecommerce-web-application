const mongoose = require("mongoose");
const { Schema } = mongoose;
const AgriProduct = require("./agriProduct.model");

const goodsReceivedDetailSchema = new Schema(
  {
    goodsReceivedNote: {
      type: Schema.Types.ObjectId,
      ref: "GoodsReceivedNote",
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "AgriProduct",
      required: true,
    },

    variant: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    idBatchCode: { type: String, unique: true, required: true },
    unitCost: { type: Number, required: true },
    quantityImported: { type: Number, required: true },
    quantityRemaining: { type: Number, required: true },
    harvestDate: { type: Date },
    expiryDate: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

goodsReceivedDetailSchema.statics.updateAgriProductStatsBulk = async function (
  productVariantPairs //[{ productId, variantId }]
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + 5);
  cutoffDate.setHours(0, 0, 0, 0);

  if (!Array.isArray(productVariantPairs) || productVariantPairs.length === 0)
    return;

  const uniquePairs = new Set(
    productVariantPairs.map((p) =>
      JSON.stringify({ p: p.productId, v: p.variantId || null })
    )
  );

  const bulkOps = [];

  for (const pairString of uniquePairs) {
    const { p: productId, v: variantId } = JSON.parse(pairString);

    if (!productId) continue;
    const castedProductId =
      mongoose.Types.ObjectId.createFromHexString(productId);
    const castedVariantId = variantId
      ? mongoose.Types.ObjectId.createFromHexString(variantId)
      : null;
    const matchCondition = {
      product: castedProductId,
      variant: castedVariantId,
      quantityRemaining: { $gt: 0 },
      $or: [{ expiryDate: { $gte: cutoffDate } }, { expiryDate: null }],
    };

    const stats = await this.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ["$unitCost", "$quantityRemaining"] },
          },
          totalQuantity: { $sum: "$quantityRemaining" },
        },
      },
    ]);

    let newAverageCost = null;
    if (stats.length > 0 && stats[0].totalQuantity > 0) {
      newAverageCost = stats[0].totalValue / stats[0].totalQuantity;
    }

    console.log(
      `[Stats Calc] Product: ${productId} | Variant: ${variantId} | New AvgCost: ${newAverageCost}`
    );

    const nearestBatch = await this.findOne({
      ...matchCondition,
      expiryDate: { $ne: null },
    })
      .sort({ expiryDate: 1 })
      .limit(1)
      .lean();

    if (variantId) {
      bulkOps.push({
        updateOne: {
          filter: { _id: productId, "variants._id": variantId },
          update: {
            $set: {
              "variants.$.averageCost": newAverageCost,
              "variants.$.nearestExpiryDate": nearestBatch
                ? nearestBatch.expiryDate
                : null,
              "variants.$.nearestHarvestDate": nearestBatch
                ? nearestBatch.harvestDate
                : null,
            },
          },
        },
      });
    } else {
      bulkOps.push({
        updateOne: {
          filter: { _id: productId },
          update: {
            $set: {
              averageCost: newAverageCost,
              nearestExpiryDate: nearestBatch ? nearestBatch.expiryDate : null,
              nearestHarvestDate: nearestBatch
                ? nearestBatch.harvestDate
                : null,
            },
          },
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    try {
      await AgriProduct.bulkWrite(bulkOps);
      console.log(
        `[GoodsReceivedDetail] Updated stats for ${bulkOps.length} product/variant pairs.`
      );
    } catch (err) {
      console.error("Error during AgriProduct bulkWrite:", err);
    }
  }
};

const GoodsReceivedDetail = mongoose.model(
  "GoodsReceivedDetail",
  goodsReceivedDetailSchema
);

module.exports = GoodsReceivedDetail;
