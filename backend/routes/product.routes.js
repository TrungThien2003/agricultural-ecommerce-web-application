const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByIds,
} = require("../controllers/product.controllers.js");
const {
  assignUserMiddleware,
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/", assignUserMiddleware, getAllProducts);
router.get("/:id", getProductById);
router.post("/get-by-ids", getProductsByIds);
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
