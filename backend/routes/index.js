const express = require("express");
const router = express.Router();
const productRouter = require("./product.routes");
const providerRouter = require("./provider.router");
const typeRouter = require("./type.routes");
const userRouter = require("./user.routes");
const standardRouter = require("./standard.route");
const methodRouter = require("./method.routes");
const vnpayRouter = require("./vnpay.route");

router.use("/providers", providerRouter);
router.use("/products", productRouter);
router.use("/types", typeRouter);
router.use("/users", userRouter);
router.use("/standards", standardRouter);
router.use("/methods", methodRouter);
router.use("/inventory", require("./inventory.route"));
router.use("/orders", require("./order.route"));
router.use("/payment", require("./zalo.route"));
router.use("/stats", require("./stats.route"));
router.use("/comments", require("./comment.route"));
router.use("/vnpay", vnpayRouter);

router.get("/", (req, res) => {
  res.send("Welcome to the AgriBackend API");
});

module.exports = router;
