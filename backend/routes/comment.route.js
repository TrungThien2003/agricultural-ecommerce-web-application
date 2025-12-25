const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByProduct,
  deleteMyComment,
  replyComment,
  toggleHideComment,
  deleteCommentAdmin,
  getAllCommentsAdmin,
} = require("../controllers/comment.controllers");

const {
  adminMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");

router.get("/product/:productId", getCommentsByProduct);

router.post("/", authMiddleware, createComment);

router.delete("/:id", authMiddleware, deleteMyComment);

router.post("/:id/reply", authMiddleware, adminMiddleware, replyComment);

router.put(
  "/:id/toggle-hidden",
  authMiddleware,
  adminMiddleware,
  toggleHideComment
);

router.get("/admin/all", authMiddleware, adminMiddleware, getAllCommentsAdmin);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  deleteCommentAdmin
);

module.exports = router;
