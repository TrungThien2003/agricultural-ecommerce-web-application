const moment = require("moment");
const querystring = require("qs");
const crypto = require("crypto");
const config = require("config");
const Order = require("../models/orderSchema.model"); // Đảm bảo đúng đường dẫn tới Model
const OrderDetail = require("../models/orderDetail.model");
const GoodsReceivedDetail = require("../models/goodsReceivedDetail.model");

// Hàm sắp xếp tham số theo thứ tự bảng chữ cái (Bắt buộc của VNPAY)
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

const createPaymentUrl = async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // Lấy cấu hình
    const tmnCode = config.get("vnp_TmnCode");
    const secretKey = config.get("vnp_HashSecret");
    let vnpUrl = config.get("vnp_Url");
    const returnUrl = config.get("vnp_ReturnUrl");

    // Lấy dữ liệu từ Client
    const { orderId, bankCode, language } = req.body;

    // Truy vấn DB để lấy số tiền chính xác (Bảo mật)
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Tạo mã tham chiếu giao dịch (vnp_TxnRef)
    // Lưu ý: Mỗi lần thử thanh toán lại phải có mã này khác nhau
    const vnp_TxnRef = moment(date).format("DDHHmmss");

    // Cập nhật mã tham chiếu này vào Order để sau này đối soát
    // Bạn cần thêm field 'paymentRef' vào Order Schema
    await Order.findByIdAndUpdate(orderId, {
      $set: { paymentRef: vnp_TxnRef },
    });

    let locale = language || "vn";
    let currCode = "VND";

    // Chuẩn bị tham số VNPAY
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = vnp_TxnRef;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang:" + vnp_TxnRef;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = order.total * 100; // Nhân 100 theo quy định VNPAY
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    // Sắp xếp và tạo chữ ký
    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac
      .update(new Buffer.from(signData, "utf-8"))
      .digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    // Tạo URL cuối cùng
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    // Trả về cho Frontend
    return res.status(200).json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error("Error create payment url:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const vnpayReturn = (req, res) => {
  try {
    console.log("Co chay vao controller return");
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = config.get("vnp_HashSecret");
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac
      .update(new Buffer.from(signData, "utf-8"))
      .digest("hex");

    // URL Frontend (React/Vue) để hiển thị kết quả
    const frontendUrl = "http://localhost:5173";

    if (secureHash === signed) {
      // Checksum hợp lệ
      if (vnp_Params["vnp_ResponseCode"] === "00") {
        // Thành công -> Redirect về trang Success
        return res.redirect(
          `${frontendUrl}/order-success?code=${vnp_Params["vnp_ResponseCode"]}`
        );
      } else {
        // Thất bại -> Redirect về trang Failed
        return res.redirect(
          `${frontendUrl}/order-failed?code=${vnp_Params["vnp_ResponseCode"]}`
        );
      }
    } else {
      // Sai chữ ký
      return res.redirect(`${frontendUrl}/order-failed?code=97`);
    }
  } catch (error) {
    console.error("Error vnpay return:", error);
    return res.redirect("http://localhost:5173/order-failed?code=99");
  }
};

const vnpayIpn = async (req, res) => {
  try {
    console.log("Co chay vao ipn");
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    const orderRef = vnp_Params["vnp_TxnRef"];
    const rspCode = vnp_Params["vnp_ResponseCode"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = config.get("vnp_HashSecret");
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac
      .update(new Buffer.from(signData, "utf-8"))
      .digest("hex");

    // Kiểm tra chữ ký
    if (secureHash !== signed) {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Checksum failed" });
    }

    // Tìm đơn hàng trong DB theo paymentRef
    const order = await Order.findOne({ paymentRef: orderRef });
    console.log("order ref", orderRef, order);

    if (!order) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    // Kiểm tra số tiền (Chia 100 vì VNPAY nhân 100)
    const amountFromVNP = parseInt(vnp_Params["vnp_Amount"]) / 100;
    if (order.total > amountFromVNP) {
      return res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
    }

    // Kiểm tra trạng thái đơn hàng (để tránh cập nhật trùng)
    if (order.isPaid) {
      return res.status(200).json({
        RspCode: "02",
        Message: "This order has been updated to the payment status",
      });
    }

    // Cập nhật trạng thái
    if (rspCode === "00") {
      // Thanh toán thành công
      order.isPaid = true;
      order.paymentMethod = "VNPAY";
      order.paidAt = new Date();
      await order.save();
      console.log("Cap nhat don hang isPaid = true thanh cong", order);

      console.log(`Order ${orderRef} updated success`);
      return res.status(200).json({ RspCode: "00", Message: "Success" });
    } else {
      // Thanh toán thất bại (Có thể cập nhật status = Cancelled nếu muốn)
      // Thanh toán thất bại
      try {
        // Kiểm tra trạng thái đơn hàng
        // Với IPN, nên trả về RspCode 02 (Order already confirmed) thay vì HTTP 400
        if (
          order.orderStatus !== "pending" &&
          order.orderStatus !== "confirmed"
        ) {
          return res
            .status(200)
            .json({ RspCode: "02", Message: "Order already confirmed" });
        }

        // Nếu đã hủy rồi thì trả về thành công luôn để VNPAY không gọi lại nữa
        if (order.orderStatus === "cancelled") {
          return res
            .status(200)
            .json({ RspCode: "00", Message: "Confirm Success" });
        }

        // *** QUAN TRỌNG: Hoàn lại tồn kho (Rollback Stock) ***
        const details = await OrderDetail.find({ order: order._id });
        const affectedProductPairs = new Set();

        for (const detail of details) {
          const batch = await GoodsReceivedDetail.findById(detail.batch);
          if (batch) {
            batch.quantityRemaining += detail.quantity;
            await batch.save();

            affectedProductPairs.add(
              JSON.stringify({
                productId: batch.product,
                variantId: batch.variant,
              })
            );
          }
        }

        // Cập nhật trạng thái đơn hàng
        order.orderStatus = "cancelled";
        await order.save(); // Không cần gán biến updatedOrder vì không trả về nó

        // Cập nhật lại stats
        try {
          const productPairsToUpdate = Array.from(affectedProductPairs)
            .map((s) => JSON.parse(s))
            .map((p) => ({ productId: p.productId, variantId: p.variantId }));

          await GoodsReceivedDetail.updateAgriProductStatsBulk(
            productPairsToUpdate
          );
        } catch (statError) {
          console.error("Lỗi cập nhật stats:", statError.message);
        }
      } catch (error) {
        console.error("Lỗi xử lý hủy đơn hàng:", error);
        // Trong trường hợp lỗi Server, trả về RspCode 99 (Unknow error)
        return res.status(200).json({ RspCode: "99", Message: "Unknow error" });
      }

      // Phản hồi chuẩn cho VNPAY ghi nhận thành công
      return res
        .status(200)
        .json({ RspCode: "00", Message: "Confirm Success" });
    }
  } catch (error) {
    console.error("Error vnpay ipn:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

const create = async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    // Thời gian tạo đơn
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    // Thời gian hết hạn (Expire Date) = Thời gian tạo + 15 phút
    let expireDate = moment(date).add(15, "minutes").format("YYYYMMDDHHmmss");

    // Lấy IP Address
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // FIX IP: Nếu là localhost (::1 hoặc 127.0.0.1) thì gán cứng IP Public để VNPAY không chặn
    if (ipAddr === "::1" || ipAddr === "127.0.0.1") {
      ipAddr = "8.8.8.8";
    }

    // Lấy cấu hình từ file config
    let tmnCode = config.get("vnp_TmnCode");
    let secretKey = config.get("vnp_HashSecret");
    let vnpUrl = config.get("vnp_Url");
    let returnUrl = config.get("vnp_ReturnUrl");

    // Lấy dữ liệu từ Client
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;
    let locale = req.body.language;

    // Tạo mã đơn hàng (Nên đảm bảo duy nhất)
    // Format: DDHHmmss + số ngẫu nhiên để tránh trùng lặp khi test nhiều lần
    let orderId =
      moment(date).format("DDHHmmss") + Math.floor(Math.random() * 1000);

    // --- KIỂM TRA LOCALE ---
    if (
      locale === null ||
      locale === "" ||
      (locale !== "vn" && locale !== "en")
    ) {
      locale = "vn";
    }

    // --- TẠO DANH SÁCH THAM SỐ (vnp_Params) ---
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + orderId;
    vnp_Params["vnp_OrderType"] = "other"; // Hoặc 'billpayment'

    // Số tiền bắt buộc nhân 100 và là số nguyên
    vnp_Params["vnp_Amount"] = Math.floor(amount * 100);

    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    // --- THÊM EXPIRE DATE (BẮT BUỘC) ---
    vnp_Params["vnp_ExpireDate"] = expireDate;

    // Kiểm tra BankCode
    vnp_Params["vnp_BankCode"] = "NCB";

    // --- BƯỚC 1: SẮP XẾP THAM SỐ ---
    vnp_Params = sortObject(vnp_Params);

    // --- BƯỚC 2: TẠO CHỮ KÝ (SECURE HASH) ---
    // Sử dụng 'qs' thay vì tạo chuỗi thủ công để đảm bảo encode đúng chuẩn
    let signData = querystring.stringify(vnp_Params, { encode: false });

    let hmac = crypto.createHmac("sha512", secretKey);
    // Sử dụng Buffer.from thay vì new Buffer (đã deprecated)
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;

    // --- BƯỚC 3: TẠO URL CUỐI CÙNG ---
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    console.log("VNPAY URL Created: ", vnpUrl); // Log ra để debug nếu cần

    // Trả về URL cho frontend redirect
    return res.status(200).json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error("Error creating VNPAY URL:", error);
    return res.status(500).json({ error: "Lỗi tạo link thanh toán VNPAY" });
  }
};

// Export các hàm ra ngoài
module.exports = {
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn,
  create,
};
