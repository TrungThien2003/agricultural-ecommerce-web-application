const Order = require("../models/orderSchema.model");
const GoodsReceivedDetail = require("../models/goodsReceivedDetail.model");

const getWarningDate = (days = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const getInventoryStats = async (req, res) => {
  try {
    const warningDate = getWarningDate(30);

    const [totalStats, stockByVariantByCategory, expiringBatches] =
      await Promise.all([
        GoodsReceivedDetail.aggregate([
          { $match: { quantityRemaining: { $gt: 0 } } },
          {
            $group: {
              _id: null,
              totalStockValue: {
                $sum: { $multiply: ["$quantityRemaining", "$unitCost"] },
              },
              totalStockQuantity: { $sum: "$quantityRemaining" },
            },
          },
        ]),

        GoodsReceivedDetail.aggregate([
          { $match: { quantityRemaining: { $gt: 0 } } },

          // 1. Lấy thông tin Sản phẩm gốc (Chứa cả mảng variants)
          {
            $lookup: {
              from: "agriproducts",
              localField: "product",
              foreignField: "_id",
              as: "productInfo",
            },
          },
          { $unwind: "$productInfo" },

          // 2. Lấy thông tin Danh mục (Type)
          {
            $lookup: {
              from: "typeofagriproducts",
              localField: "productInfo.type",
              foreignField: "_id",
              as: "typeInfo",
            },
          },
          { $unwind: "$typeInfo" },

          // --- BƯỚC MỚI: TÌM BIẾN THỂ TRONG MẢNG productInfo.variants ---
          {
            $addFields: {
              // Tìm sub-document trong mảng variants có _id trùng với variant trong kho
              foundVariant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$productInfo.variants", // Mảng variants nhúng
                      as: "v",
                      cond: { $eq: ["$$v._id", "$variant"] }, // So sánh ID
                    },
                  },
                  0,
                ],
              },
            },
          },

          // 3. Gom nhóm
          {
            $group: {
              _id: {
                categoryId: "$typeInfo._id",
                categoryName: "$typeInfo.name",
                productId: "$productInfo._id",
                productName: "$productInfo.name",

                // --- LẤY TÊN BIẾN THỂ ---
                // Nếu tìm thấy foundVariant -> Lấy .name
                // Nếu không (là sp gốc hoặc không tìm thấy) -> Lấy null
                variant: { $ifNull: ["$foundVariant.name", null] },

                // Đơn vị/Trọng lượng: Ưu tiên lấy của biến thể trước, nếu không có lấy của SP gốc
                unit: { $ifNull: ["$foundVariant.unit", "$productInfo.unit"] },
                weight: {
                  $ifNull: ["$foundVariant.weight", "$productInfo.weight"],
                },

                image: { $arrayElemAt: ["$productInfo.images", 0] },
              },
              totalVariantStock: { $sum: "$quantityRemaining" },
              totalVariantValue: {
                $sum: { $multiply: ["$quantityRemaining", "$unitCost"] },
              },
            },
          },

          // 4. Gom về danh mục (Giữ nguyên)
          {
            $group: {
              _id: "$_id.categoryName",
              products: {
                $push: {
                  productId: "$_id.productId",
                  productName: "$_id.productName",
                  variant: "$_id.variant",
                  unit: "$_id.unit",
                  weight: "$_id.weight",
                  stock: "$totalVariantStock",
                  value: "$totalVariantValue",
                  image: "$_id.image",
                },
              },
              totalCategoryStock: { $sum: "$totalVariantStock" },
            },
          },
          { $sort: { totalCategoryStock: -1 } },
        ]),

        GoodsReceivedDetail.aggregate([
          {
            $match: {
              quantityRemaining: { $gt: 0 },
              expiryDate: { $lte: warningDate },
            },
          },
          {
            $lookup: {
              from: "agriproducts",
              localField: "product",
              foreignField: "_id",
              as: "productInfo",
            },
          },
          { $unwind: "$productInfo" },

          {
            $project: {
              batchId: "$idBatchCode",
              productName: "$productInfo.name",

              foundVariant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$productInfo.variants", // Mảng variants nhúng
                      as: "v",
                      cond: { $eq: ["$$v._id", "$variant"] }, // So sánh ID
                    },
                  },
                  0,
                ],
              },

              expiryDate: 1,
              remaining: "$quantityRemaining",
              daysLeft: {
                $divide: [
                  { $subtract: ["$expiryDate", new Date()] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
          {
            $project: {
              batchId: 1,
              productName: 1,
              expiryDate: 1,
              remaining: 1,
              daysLeft: 1,

              variant: { $ifNull: ["$foundVariant.name", null] },
              unit: { $ifNull: ["$foundVariant.unit", "$productInfo.unit"] },
              weight: {
                $ifNull: ["$foundVariant.weight", "$productInfo.weight"],
              },
            },
          },
          { $sort: { expiryDate: 1 } },
        ]),
      ]);

    res.json({
      summary: {
        totalValue: totalStats[0]?.totalStockValue || 0,
        totalQuantity: totalStats[0]?.totalStockQuantity || 0,
      },
      stockByCategory: stockByVariantByCategory,
      expiringBatches,
    });
  } catch (error) {
    console.error("Lỗi thống kê kho:", error);
    res.status(500).json({ error: "Lỗi thống kê kho hàng" });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 1. Cấu hình điều kiện lọc
    const matchStage = {
      orderStatus: { $in: ["delivered"] }, // CHỈ TÍNH ĐƠN ĐÃ GIAO THÀNH CÔNG ĐỂ TÍNH LỢI NHUẬN THỰC TẾ
      // Nếu muốn tính cả đơn đang giao (doanh thu dự kiến), thêm "shipping", "confirmed"
    };

    if (startDate && endDate) {
      matchStage.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const result = await Order.aggregate([
      // --- BƯỚC 1: Lọc Order ---
      { $match: matchStage },

      // --- BƯỚC 2: Bung OrderDetails ---
      {
        $lookup: {
          from: "orderdetails",
          localField: "orderItems",
          foreignField: "_id",
          as: "details",
        },
      },
      { $unwind: "$details" },

      // --- BƯỚC 3: Lấy giá vốn từ Lô hàng (GoodsReceivedDetail) ---
      // Đây là bước quan trọng để tính chính xác lợi nhuận
      {
        $lookup: {
          from: "goodsreceiveddetails",
          localField: "details.batch",
          foreignField: "_id",
          as: "batchInfo",
        },
      },
      // Dùng preserveNullAndEmptyArrays để nếu dữ liệu lô bị lỗi, ta vẫn tính được doanh thu (dù lợi nhuận sẽ không chính xác tuyệt đối)
      { $unwind: { path: "$batchInfo", preserveNullAndEmptyArrays: true } },

      // --- BƯỚC 4: Tính toán từng dòng sản phẩm ---
      {
        $project: {
          orderDate: 1,
          paymentType: { $ifNull: ["$paymentType", "cod"] },

          // Doanh thu = Giá bán * Số lượng
          lineRevenue: { $multiply: ["$details.quantity", "$details.price"] },

          // Giá vốn = Giá nhập (từ Batch) * Số lượng
          // Fallback: Nếu không tìm thấy lô (batchInfo null), tạm tính giá vốn = 70% giá bán (hoặc 0 tùy policy)
          lineCost: {
            $multiply: [
              "$details.quantity",
              {
                $ifNull: [
                  "$batchInfo.unitCost",
                  { $multiply: ["$details.price", 0.7] },
                ],
              },
            ],
          },
        },
      },

      // --- BƯỚC 5: Tổng hợp (Facet) ---
      {
        $facet: {
          // A. Biểu đồ theo thời gian
          revenueChart: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
                },
                dailyRevenue: { $sum: "$lineRevenue" },
                dailyCost: { $sum: "$lineCost" },
                dailyProfit: {
                  $sum: { $subtract: ["$lineRevenue", "$lineCost"] },
                },
              },
            },
            {
              $project: {
                date: "$_id",
                revenue: "$dailyRevenue",
                profit: "$dailyProfit",
                _id: 0,
              },
            },
            { $sort: { date: 1 } },
          ],

          // B. Tổng hợp toàn bộ
          overallStats: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$lineRevenue" },
                totalCost: { $sum: "$lineCost" },
                totalProfit: {
                  $sum: { $subtract: ["$lineRevenue", "$lineCost"] },
                },
              },
            },
          ],

          // C. Tỷ trọng phương thức thanh toán
          paymentStats: [
            {
              $group: {
                _id: "$paymentType",
                value: { $sum: "$lineRevenue" },
              },
            },
          ],
        },
      },
    ]);

    // Xử lý kết quả trả về
    const stats = result[0];
    const overall = stats.overallStats[0] || {
      totalRevenue: 0,
      totalProfit: 0,
    };

    // Đếm số đơn hàng riêng biệt (vì aggregation ở trên đã unwind ra từng dòng items)
    const totalOrdersCount = await Order.countDocuments(matchStage);

    res.json({
      overview: {
        totalRevenue: overall.totalRevenue,
        totalProfit: overall.totalProfit, // Lợi nhuận chính xác từ (Giá bán - Giá nhập)
        totalOrders: totalOrdersCount,
        profitMargin: overall.totalRevenue
          ? ((overall.totalProfit / overall.totalRevenue) * 100).toFixed(2) +
            "%"
          : "0%",
      },
      chartData: stats.revenueChart,
      paymentMethodStats: stats.paymentStats.map((p) => ({
        name: p._id === "vnpay" ? "VNPAY" : "COD (Tiền mặt)",
        value: p.value,
      })),
    });
  } catch (error) {
    console.error("Lỗi thống kê doanh thu:", error);
    res.status(500).json({ error: "Lỗi tính toán doanh thu & lợi nhuận" });
  }
};

const getCategoryShareAndTopProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {
      orderStatus: { $in: ["delivered"] }, // Chỉ tính đơn thành công cho Top sản phẩm bán chạy thực tế
    };

    if (startDate && endDate) {
      matchStage.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
      };
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "orderdetails",
          localField: "orderItems",
          foreignField: "_id",
          as: "details",
        },
      },
      { $unwind: "$details" },
      {
        $lookup: {
          from: "goodsreceiveddetails",
          localField: "details.batch",
          foreignField: "_id",
          as: "batchInfo",
        },
      },
      { $unwind: "$batchInfo" },
      {
        $lookup: {
          from: "agriproducts",
          localField: "batchInfo.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "typeofagriproducts",
          localField: "productInfo.type",
          foreignField: "_id",
          as: "typeInfo",
        },
      },
      { $unwind: "$typeInfo" },
      {
        $facet: {
          // Top sản phẩm
          topProducts: [
            {
              $group: {
                _id: "$productInfo._id",
                name: { $first: "$productInfo.name" },
                category: { $first: "$typeInfo.name" },
                sold: { $sum: "$details.quantity" },
                revenue: {
                  $sum: { $multiply: ["$details.quantity", "$details.price"] },
                },
              },
            },
            { $sort: { revenue: -1 } }, // Sắp xếp theo doanh thu
            { $limit: 5 },
          ],
          // Tỷ trọng danh mục
          categoryShare: [
            {
              $group: {
                _id: "$typeInfo.name",
                value: {
                  $sum: { $multiply: ["$details.quantity", "$details.price"] },
                }, // Tỷ trọng theo doanh thu
              },
            },
          ],
        },
      },
    ]);

    res.json({
      topProducts: stats[0]?.topProducts || [],
      categoryShare: stats[0]?.categoryShare || [],
    });
  } catch (error) {
    console.error("Lỗi thống kê sản phẩm:", error);
    res.status(500).json({ error: "Lỗi thống kê sản phẩm" });
  }
};

module.exports = {
  getInventoryStats,
  getRevenueStats,
  getCategoryShareAndTopProducts,
};
