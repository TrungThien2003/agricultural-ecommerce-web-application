const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controllers");

router.get("/inventory", statsController.getInventoryStats);
router.get("/revenue", statsController.getRevenueStats);
router.get("/products", statsController.getCategoryShareAndTopProducts);

module.exports = router;
