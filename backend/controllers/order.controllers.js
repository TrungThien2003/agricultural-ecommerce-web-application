const mongoose = require("mongoose");
const Order = require("../models/orderSchema.model");
const OrderDetail = require("../models/orderDetail.model");
const AgriProduct = require("../models/agriProduct.model");
const GoodsReceivedDetail = require("../models/goodsReceivedDetail.model");
const { zaloPayment } = require("./zalo-payment.controllers");
const crypto = require("crypto");
const moment = require("moment");
const config = require("config");
const ExcelJS = require("exceljs");
const querystring = require("qs");

const createOrder = async (req, res) => {
  const { userId, customer, items, totals, paymentMethod, bankCode, language } =
    req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Giỏ hàng rỗng." });
  }
  if (!customer || !totals || !paymentMethod) {
    return res.status(400).json({ error: "Thông tin đơn hàng không đầy đủ." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let savedOrder = null;
  let transactionCommitted = false;

  try {
    const newOrderDetails = [];
    const affectedProductPairs = new Set();

    for (const item of items) {
      let quantityToFulfill = item.quantity;

      const parts = item.cartItemId.split("_");
      const productId = parts[0];
      const variantIdString = parts.slice(1).join("_");
      const variantId =
        variantIdString === "base_product"
          ? null
          : new mongoose.Types.ObjectId(variantIdString);

      affectedProductPairs.add(JSON.stringify({ productId, variantId }));

      const product = await AgriProduct.findById(productId).session(session);
      if (!product) {
        throw new Error(`Sản phẩm ${item.productName} không còn tồn tại.`);
      }
      product.sold = (product.sold || 0) + item.quantity;
      await product.save({ session });

      const availableBatches = await GoodsReceivedDetail.find({
        product: productId,
        variant: variantId,
        quantityRemaining: { $gt: 0 },
      })
        .session(session)
        .sort({ expiryDate: 1 });

      const totalStock = availableBatches.reduce(
        (sum, b) => sum + b.quantityRemaining,
        0
      );
      if (totalStock < quantityToFulfill) {
        throw new Error(
          `Không đủ tồn kho cho ${item.productName}. Chỉ còn ${totalStock}.`
        );
      }

      for (const batch of availableBatches) {
        if (quantityToFulfill <= 0) break;

        const quantityFromThisBatch = Math.min(
          batch.quantityRemaining,
          quantityToFulfill
        );

        const detail = new OrderDetail({
          batch: batch._id,
          product: productId,
          variant: variantId,
          price: item.price,
          quantity: quantityFromThisBatch,
        });
        const savedDetail = await detail.save({ session });
        newOrderDetails.push(savedDetail);

        batch.quantityRemaining -= quantityFromThisBatch;
        await batch.save({ session });

        quantityToFulfill -= quantityFromThisBatch;
      }
    }

    const newOrder = new Order({
      user: userId,
      orderDate: new Date(),
      total: totals.total,
      isPaid: false,
      paymentType: paymentMethod,
      orderStatus: paymentMethod === "cod" ? "confirmed" : "pending",

      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerNote: customer.note,

      paymentRef: "",

      orderItems: newOrderDetails.map((d) => d._id),
    });

    savedOrder = await newOrder.save({ session });

    await OrderDetail.updateMany(
      { _id: { $in: newOrderDetails.map((d) => d._id) } },
      { $set: { order: savedOrder._id } }
    ).session(session);

    await session.commitTransaction();
    transactionCommitted = true;

    try {
      const productPairsToUpdate = Array.from(affectedProductPairs)
        .map((s) => JSON.parse(s))
        .map((p) => ({ productId: p.productId, variantId: p.variantId }));

      if (GoodsReceivedDetail.updateAgriProductStatsBulk) {
        await GoodsReceivedDetail.updateAgriProductStatsBulk(
          productPairsToUpdate
        );
      }
    } catch (statError) {
      console.error(
        "Lỗi update stats (không ảnh hưởng đơn hàng):",
        statError.message
      );
    }

    if (paymentMethod === "cod") {
      return res.status(201).json({
        success: true,
        orderId: savedOrder._id,
        message: "Đặt hàng COD thành công!",
      });
    } else if (paymentMethod === "vnpay") {
      try {
        process.env.TZ = "Asia/Ho_Chi_Minh";
        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");
        const expireDate = moment(date)
          .add(15, "minutes")
          .format("YYYYMMDDHHmmss");

        const ipAddr =
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress ||
          "127.0.0.1";

        const tmnCode = config.get("vnp_TmnCode");
        const secretKey = config.get("vnp_HashSecret");
        let vnpUrl = config.get("vnp_Url");
        const returnUrl = config.get("vnp_ReturnUrl");

        const vnp_TxnRef =
          moment(date).format("DDHHmmss") + Math.floor(Math.random() * 1000);
        savedOrder.paymentRef = vnp_TxnRef;
        await savedOrder.save();

        let vnp_Params = {};
        vnp_Params["vnp_Version"] = "2.1.0";
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = tmnCode;
        vnp_Params["vnp_Locale"] = req.body.language || "vn";
        vnp_Params["vnp_CurrCode"] = "VND";
        vnp_Params["vnp_TxnRef"] = vnp_TxnRef;
        vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + savedOrder._id; // Hoặc savedOrder.code
        vnp_Params["vnp_OrderType"] = "other";

        vnp_Params["vnp_Amount"] = Math.floor(savedOrder.total * 100);

        vnp_Params["vnp_ReturnUrl"] = returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        vnp_Params["vnp_ExpireDate"] = expireDate;

        if (req.body.bankCode) {
          vnp_Params["vnp_BankCode"] = req.body.bankCode;
        }
        vnp_Params = sortObject(vnp_Params);
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac
          .update(Buffer.from(signData, "utf-8"))
          .digest("hex");

        vnp_Params["vnp_SecureHash"] = signed;
        vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

        return res.status(201).json({
          success: true,
          message: "Đơn hàng đã được tạo. Vui lòng thanh toán.",
          order: savedOrder,
          paymentUrl: vnpUrl,
        });
      } catch (vnpError) {
        console.error("Lỗi tạo link VNPAY:", vnpError);
        return res.status(500).json({
          success: true,
          orderId: savedOrder._id,
          error: "Đơn hàng đã tạo nhưng lỗi kết nối cổng thanh toán",
          shouldRetryPayment: true,
        });
      }
    } else {
      return res
        .status(400)
        .json({ error: "Phương thức thanh toán không hợp lệ." });
    }
  } catch (error) {
    console.error("Lỗi Transaction tạo đơn hàng:", error.message);
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    return res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-orderItems -user");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ." });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentType } = req.query;

    let filter = {};

    if (status && status !== "") {
      filter.orderStatus = status;
    }

    if (paymentType && paymentType !== "") {
      filter.paymentType = paymentType;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      filter.orderDate = {
        $gte: start,
        $lte: end,
      };
    }

    const orders = await Order.find(filter)
      .populate("user", "fullname email")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi tải danh sách đơn hàng." });
  }
};

const getOrderById = async (req, res) => {
  try {
    console.log("Fetching order with ID:", req.params.id);
    const order = await Order.findById(req.params.id)
      .populate("user", "fullname email")
      .populate({
        path: "orderItems",
        populate: {
          path: "batch",
          model: "GoodsReceivedDetail",
          populate: {
            path: "product",
            model: "AgriProduct",
            select: "name images unit variants weight",
          },
        },
      });

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    res.json(order);
  } catch (error) {
    console.log("Error fetching order:", error);
    res.status(500).json({ error: "Lỗi máy chủ." });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.orderId;
  console.log("id de cap nhat la", orderId);

  if (
    !["pending", "confirmed", "shipping", "delivered", "cancelled"].includes(
      status
    )
  ) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ." });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (status === "cancelled") {
      console.log("Chuyen sang ham huy don hang");
      return cancelOrder(req, res);
    }

    if (status === "delivered" && order.paymentType === "cod") {
      order.isPaid = true;
    }

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ: " + error.message });
  }
};

const cancelOrder = async (req, res) => {
  const orderId = req.params.orderId;

  console.log("Yeu cau huy don hang:", orderId);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (!order.user.equals(req?.user?._id) && !req?.user?.isAdmin) {
      console.log("order.user va req.user._id ", order.user, req.user._id);
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ error: "Không có quyền truy cập." });
    }

    if (order.orderStatus !== "pending" && order.orderStatus !== "confirmed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error:
          "Không thể hủy đơn hàng đang được vận chuyển hoặc đã hoàn thành.",
      });
    }

    if (order.orderStatus === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json(order);
    }

    const details = await OrderDetail.find({ order: orderId }).session(session);

    const affectedProductPairs = new Set();

    for (const detail of details) {
      const batch = await GoodsReceivedDetail.findById(detail.batch).session(
        session
      );
      if (batch) {
        batch.quantityRemaining += detail.quantity;
        await batch.save({ session });

        affectedProductPairs.add(
          JSON.stringify({
            productId: batch.product,
            variantId: batch.variant,
          })
        );
      }
    }

    order.orderStatus = "cancelled";
    const updatedOrder = await order.save({ session });

    await session.commitTransaction();

    try {
      const productPairsToUpdate = Array.from(affectedProductPairs)
        .map((s) => JSON.parse(s))
        .map((p) => ({ productId: p.productId, variantId: p.variantId }));

      await GoodsReceivedDetail.updateAgriProductStatsBulk(
        productPairsToUpdate
      );
    } catch (statError) {
      console.error(
        "Lỗi khi cập nhật stats sau khi hủy đơn hàng:",
        statError.message
      );
    }

    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: "Lỗi máy chủ: " + error.message });
  } finally {
    session.endSession();
  }
};

const cancelOrderByAppTransId = async (req, res) => {
  const paymentTransactionId = req.params.paymentTransactionId;

  console.log("Yeu cau huy don hang:", paymentTransactionId);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ paymentTransactionId }).session(
      session
    );
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (!order.user.equals(req?.user?._id) && !req?.user?.isAdmin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ error: "Không có quyền truy cập." });
    }

    if (order.orderStatus !== "pending" && order.orderStatus !== "confirmed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error:
          "Không thể hủy đơn hàng đang được vận chuyển hoặc đã hoàn thành.",
      });
    }

    if (order.orderStatus === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json(order); // Trả về đơn hàng đã hủy
    }

    const details = await OrderDetail.find({ order: order._id }).session(
      session
    );

    const affectedProductPairs = new Set();

    for (const detail of details) {
      const batch = await GoodsReceivedDetail.findById(detail.batch).session(
        session
      );
      if (batch) {
        batch.quantityRemaining += detail.quantity;
        await batch.save({ session });

        affectedProductPairs.add(
          JSON.stringify({
            productId: batch.product,
            variantId: batch.variant,
          })
        );
      }
    }

    order.orderStatus = "cancelled";
    const updatedOrder = await order.save({ session });

    await session.commitTransaction();

    try {
      const productPairsToUpdate = Array.from(affectedProductPairs)
        .map((s) => JSON.parse(s))
        .map((p) => ({ productId: p.productId, variantId: p.variantId }));

      await GoodsReceivedDetail.updateAgriProductStatsBulk(
        productPairsToUpdate
      );
    } catch (statError) {
      console.error(
        "Lỗi khi cập nhật stats sau khi hủy đơn hàng:",
        statError.message
      );
    }

    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: "Lỗi máy chủ: " + error.message });
  } finally {
    session.endSession();
  }
};

const drawInvoiceOnWorksheet = (worksheet, order) => {
  worksheet.properties.defaultRowHeight = 20;

  worksheet.mergeCells("A1:E1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "HÓA ĐƠN BÁN HÀNG";
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.font = { size: 16, bold: true };

  worksheet.getCell("A2").value = `Mã đơn hàng: #${order._id
    .toString()
    .slice(-6)
    .toUpperCase()}`;
  worksheet.getCell("A3").value = `Ngày Đặt: ${new Date(
    order.createdAt || new Date()
  ).toLocaleDateString("vi-VN")}`;
  worksheet.getCell("A4").value = `Khách Hàng: ${order.customerName || ""}`;
  worksheet.getCell("A5").value = `Điện Thoại: ${order.customerPhone || ""}`;
  worksheet.getCell("A6").value = `Đ/C: ${order.customerAddress || ""}`;

  const headerRow = worksheet.getRow(8);
  headerRow.values = [
    "STT",
    "Tên sản phẩm",
    "Batch",
    "SL",
    "Đơn giá",
    "Thành tiền",
  ];
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2E7D32" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let rowIndex = 9;

  if (order.orderItems && order.orderItems.length > 0) {
    order.orderItems.forEach((item, index) => {
      const batch = item.batch;
      const product = batch ? batch.product : null;
      const variantId = batch ? batch.variant : null;
      let displayName = "Sản phẩm đã bị xóa";
      let batchCode = batch ? batch.idBatchCode : "N/A";

      if (product) {
        const variantObj =
          variantId && product.variants
            ? product.variants.find(
                (v) => v._id.toString() === variantId.toString()
              )
            : null;

        if (variantObj) {
          displayName = `${product.name} - ${variantObj.name}`;
        } else {
          const unit = product.unit || "";
          const weight = product.weight || "";
          displayName = `${product.name} (${unit} ${weight}kg)`;
        }
      }

      const row = worksheet.getRow(rowIndex);
      row.values = [
        index + 1,
        displayName,
        batchCode,
        item.quantity,
        item.price,
        item.quantity * item.price,
      ];

      row.getCell(5).numFmt = '#,##0 "₫"';
      row.getCell(6).numFmt = '#,##0 "₫"';
      row.getCell(2).alignment = { wrapText: true };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rowIndex++;
    });
  }

  const totalRow = worksheet.getRow(rowIndex);
  totalRow.getCell(5).value = "TỔNG CỘNG:";
  totalRow.getCell(5).font = { bold: true };
  totalRow.getCell(5).alignment = { horizontal: "right" };

  totalRow.getCell(6).value = order.total || 0;
  totalRow.getCell(6).font = { bold: true, color: { argb: "FFEE0000" } };
  totalRow.getCell(6).numFmt = '#,##0 "₫"';

  worksheet.columns = [
    { width: 5 },
    { width: 35 },
    { width: 15 },
    { width: 8 },
    { width: 15 },
    { width: 15 },
  ];
};

const exportOrderToExcel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "orderItems",
      populate: {
        path: "batch",
        populate: {
          path: "product",
        },
      },
    });

    if (!order) return res.status(404).json({ error: "Not found" });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `Order_${order._id.toString().slice(-4)}`
    );

    drawInvoiceOnWorksheet(worksheet, order);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Order_${order._id}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const exportFilteredOrders = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentType } = req.query;

    // 1. Xây dựng bộ lọc (Giữ nguyên)
    let filter = {};
    if (status) filter.orderStatus = status;
    if (paymentType) filter.paymentType = paymentType;
    if (startDate && endDate) {
      filter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
      };
    }

    // 2. Tìm đơn hàng
    // QUAN TRỌNG: Populate phải khớp với logic của hàm drawInvoiceOnWorksheet
    // Chúng ta chỉ cần populate đến 'product' là đủ vì mảng 'variants' nằm trong 'product'
    const orders = await Order.find(filter)
      .populate({
        path: "orderItems",
        populate: {
          path: "batch",
          populate: { path: "product" }, // Lấy product sẽ có luôn variants
        },
      })
      .sort({ orderDate: -1 });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy đơn hàng nào thỏa mãn điều kiện." });
    }

    // 3. Tạo Workbook
    const workbook = new ExcelJS.Workbook();

    // 4. Tạo Sheet "TỔNG HỢP" (Giữ nguyên)
    const summarySheet = workbook.addWorksheet("TONG_HOP");
    summarySheet.columns = [
      { header: "STT", width: 5 },
      { header: "Mã Đơn", width: 15 },
      { header: "Ngày", width: 15 },
      { header: "Khách Hàng", width: 25 },
      { header: "SĐT", width: 15 },
      { header: "Trạng thái", width: 15 },
      { header: "Tổng tiền", width: 15 },
    ];

    // Style header tổng hợp
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).alignment = { horizontal: "center" };

    orders.forEach((o, i) => {
      const row = summarySheet.addRow([
        i + 1,
        o._id.toString().slice(-6).toUpperCase(),
        new Date(o.orderDate).toLocaleDateString("vi-VN"),
        o.customerName,
        o.customerPhone,
        o.orderStatus,
        o.total,
      ]);
      // Format tiền ở sheet tổng hợp
      row.getCell(7).numFmt = '#,##0 "₫"';
    });

    // 5. Tạo từng Sheet chi tiết
    orders.forEach((order) => {
      // Xử lý tên Sheet: Excel giới hạn 31 ký tự & cấm ký tự đặc biệt
      // VD: "2023-10-25_A1B2C3"
      const dateStr = new Date(order.orderDate).toISOString().split("T")[0]; // YYYY-MM-DD
      const idStr = order._id.toString().slice(-6).toUpperCase();
      let sheetName = `${dateStr}_${idStr}`;

      // Tạo sheet và vẽ nội dung
      const worksheet = workbook.addWorksheet(sheetName);

      // GỌI HÀM HELPER (Đã được update logic tên biến thể ở câu trả lời trước)
      drawInvoiceOnWorksheet(worksheet, order);
    });

    // 6. Xuất file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Export_Orders_${Date.now()}.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Lỗi xuất file hàng loạt:", error);
    res.status(500).json({ error: "Lỗi xuất file hàng loạt" });
  }
};
module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  cancelOrderByAppTransId,
  exportOrderToExcel,
  exportFilteredOrders,
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
