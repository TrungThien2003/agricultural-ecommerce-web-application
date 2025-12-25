const express = require("express");
const router = express.Router();
const {
  zaloCallback,
  // zaloPayment,
  momoPayment,
} = require("../controllers/zalo-payment.controllers.js");
// Public
// router.post("/", zaloPayment);
router.post("/momo", momoPayment);
router.post("/zalo-callback", zaloCallback);

module.exports = router;
