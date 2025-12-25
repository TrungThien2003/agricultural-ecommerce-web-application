const StandardOfProduct = require("../models/standardOfProduct.model");

const getAllStandards = async (req, res) => {
  try {
    const standards = await StandardOfProduct.find();

    res
      .status(200)
      .json({ message: "Lấy danh sách tiêu chuẩn thành công!", standards });
  } catch (error) {
    console.error("Lỗi khi lấy tiêu chuẩn:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

const createStandard = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Tên tiêu chuẩn là bắt buộc." });
    }
    const existingStandard = await StandardOfProduct.findOne({ name });
    if (existingStandard) {
      return res
        .status(400)
        .json({ message: "Tiêu chuẩn với tên này đã tồn tại." });
    }
    const newStandard = new StandardOfProduct({ name, description });
    await newStandard.save();
    res.status(201).json({
      message: "Tạo mới tiêu chuẩn thành công!",
      standard: newStandard,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tạo tiêu chuẩn." });
  }
};

module.exports = {
  getAllStandards,
  createStandard,
};
