const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  cancelOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrderByAppTransId,
  exportFilteredOrders,
  exportOrderToExcel,
} = require("../controllers/order.controllers.js");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware.js");

//NHÓM ROUTE DÀNH CHO ADMIN ---
router.get(
  "/export-bulk",
  authMiddleware,
  adminMiddleware,
  exportFilteredOrders
);
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.put(
  "/:orderId/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

//ROUTE DÀNH CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP ---
router.get("/my-orders", authMiddleware, getMyOrders);
router.put("/:orderId/cancel", authMiddleware, cancelOrder);
router.put(
  "/cancel/:paymentTransactionId",
  authMiddleware,
  cancelOrderByAppTransId
);
router.get("/:id", authMiddleware, getOrderById);
router.get("/export/:id", authMiddleware, exportOrderToExcel);
router.post("/", authMiddleware, createOrder);

module.exports = router;
