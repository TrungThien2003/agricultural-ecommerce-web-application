const express = require("express");
const router = express.Router();
const vnpayController = require("../controllers/vnpay.controllers");

// 1. Tạo URL thanh toán
// POST: /api/payment/create_payment_url
router.post("/create_payment_url", vnpayController.createPaymentUrl);

// 2. VNPAY Return (Browser redirect)
// GET: /api/payment/vnpay_return
// Nhớ cấu hình ReturnUrl trong Config là: http://localhost:5000/api/payment/vnpay_return
router.get("/vnpay_return", vnpayController.vnpayReturn);

// 3. VNPAY IPN (Server-to-Server)
// GET: /api/payment/vnpay_ipn
// Nhớ cấu hình IpnUrl trong Code/Ngrok là: https://xxxx.ngrok-free.app/api/payment/vnpay_ipn
router.get("/vnpay_ipn", vnpayController.vnpayIpn);

router.post("/create", vnpayController.create);

module.exports = router;
