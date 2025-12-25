const mongoose = require("mongoose"); // <--- THÊM DÒNG NÀY LÊN ĐẦU
const Comment = require("../models/comment.model");
const Order = require("../models/orderSchema.model");

const createComment = async (req, res) => {
  try {
    const { productId, rating, content, images } = req.body;
    const userId = req.user._id;

    const hasPurchased = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          orderStatus: "delivered",
        },
      },
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
        $match: {
          "batchInfo.product": new mongoose.Types.ObjectId(productId),
        },
      },
      { $limit: 1 },
    ]);

    if (hasPurchased.length === 0) {
      return res.status(403).json({
        error:
          "Bạn cần mua và nhận hàng thành công sản phẩm này để được đánh giá.",
      });
    }

    const existingComment = await Comment.findOne({
      user: userId,
      product: productId,
    });

    if (existingComment) {
      return res
        .status(400)
        .json({ error: "Bạn đã đánh giá sản phẩm này rồi." });
    }

    const newComment = new Comment({
      user: userId,
      product: productId,
      rating,
      content,
      images: images || [],
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Lỗi tạo bình luận:", error);
    res.status(500).json({ error: "Lỗi server khi gửi đánh giá." });
  }
};

const getAllCommentsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      status,
      productId,
      replyStatus,
    } = req.query;

    const filter = {};

    if (rating) filter.rating = Number(rating);
    if (status === "hidden") filter.isHidden = true;
    if (status === "visible") filter.isHidden = false;
    if (productId) filter.product = productId;
    if (replyStatus === "unreplied") {
      filter.replies = { $size: 0 };
    } else if (replyStatus === "replied") {
      filter.replies = { $not: { $size: 0 } };
    }

    const comments = await Comment.find(filter)
      .populate("user", "fullname email avatar")
      .populate("product", "name images")
      .populate("replies.admin", "fullname")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(filter);

    const totalUnreplied = await Comment.countDocuments({
      replies: { $size: 0 },
    });

    res.json({
      comments,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalUnreplied,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 5, rating } = req.query;

    let filter = { product: productId, isHidden: false };

    if (rating) {
      filter.rating = Number(rating);
    }

    const comments = await Comment.find(filter)
      .populate("user", "fullname")
      .populate("replies.admin", "fullname")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(filter);

    const distribution = await Comment.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isHidden: false,
        },
      },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    res.json({
      comments,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      distribution,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải bình luận." });
  }
};

const deleteMyComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Không tìm thấy" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Không có quyền xóa" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa đánh giá." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replyComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({ error: "Không tìm thấy bình luận." });

    comment.replies.push({
      admin: req.user._id,
      content: content,
    });

    await comment.save();

    const updatedComment = await Comment.findById(req.params.id)
      .populate("user", "fullname avatar")
      .populate("replies.admin", "fullname avatar");

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server." });
  }
};

const toggleHideComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Not found" });

    comment.isHidden = !comment.isHidden;
    await comment.save();

    res.json({
      message: comment.isHidden ? "Đã ẩn bình luận" : "Đã hiện bình luận",
      isHidden: comment.isHidden,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCommentAdmin = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin đã xóa bình luận." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComment,
  getCommentsByProduct,
  deleteMyComment,
  replyComment,
  toggleHideComment,
  deleteCommentAdmin,
  getAllCommentsAdmin,
};
