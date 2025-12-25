const mongoose = require("mongoose");
const TypeOfAgriProducts = require("../models/typeOfAgriproduct.model");

const getAllTypes = async (req, res) => {
  try {
    const types = await TypeOfAgriProducts.find({ isActive: true })
      .populate("parentType", "name")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ message: "Lấy danh sách loại nông sản thành công!", types });
  } catch (error) {
    console.error("Lỗi khi lấy loại nông sản:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách loại nông sản." });
  }
};

const getAll = async (req, res) => {
  try {
    const types = await TypeOfAgriProducts.find()
      .populate("parentType", "name")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ message: "Lấy danh sách loại nông sản thành công!", types });
  } catch (error) {
    console.error("Lỗi khi lấy loại nông sản:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách loại nông sản." });
  }
};

const getTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "ID loại sản phẩm không hợp lệ." });
    }

    const type = await TypeOfAgriProducts.findById(id).populate(
      "parentType",
      "name"
    );

    if (!type) {
      return res.status(404).json({ message: "Không tìm thấy loại sản phẩm." });
    }

    res
      .status(200)
      .json({ message: "Lấy chi tiết loại nông sản thành công!", type });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết loại nông sản:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy chi tiết loại nông sản." });
  }
};

const createType = async (req, res) => {
  try {
    const { name, profitMargin, image, parentType } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Tên loại sản phẩm là bắt buộc." });
    }
    if (profitMargin < 0) {
      return res.status(400).json({ message: "profitMargin không được âm." });
    }

    const existing = await TypeOfAgriProducts.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Loại sản phẩm này đã tồn tại." });
    }

    const newType = new TypeOfAgriProducts({
      name: name.trim(),
      profitMargin: profitMargin || 0.1,
      image,
      parentType: parentType || null,
    });

    const saved = await newType.save();
    res.status(201).json({
      message: "Thêm loại sản phẩm thành công!",
      type: saved,
    });
  } catch (error) {
    console.error("Lỗi khi tạo loại sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi tạo loại sản phẩm." });
  }
};

const updateType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, profitMargin, image, parentType, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "ID loại sản phẩm không hợp lệ." });
    }

    const type = await TypeOfAgriProducts.findById(id);
    if (!type) {
      return res.status(404).json({ message: "Không tìm thấy loại sản phẩm." });
    }

    if (profitMargin < 0) {
      return res.status(400).json({ message: "profitMargin không được âm." });
    }

    if (name) type.name = name.trim();
    if (image) type.image = image;
    if (profitMargin !== undefined) type.profitMargin = profitMargin;
    if (parentType !== undefined) type.parentType = parentType;
    if (isActive !== undefined) type.isActive = isActive;

    const updated = await type.save();

    res.status(200).json({
      message: "Cập nhật loại sản phẩm thành công!",
      type: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật loại sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật loại sản phẩm." });
  }
};

const deleteType = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "ID loại sản phẩm không hợp lệ." });
    }

    const deleted = await TypeOfAgriProducts.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy loại sản phẩm." });
    }

    res.status(200).json({ message: "Đã ẩn loại sản phẩm thành công." });
  } catch (error) {
    console.error("Lỗi khi ẩn loại sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi ẩn loại sản phẩm." });
  }
};

const getTypeTree = async (req, res) => {
  try {
    const types = await TypeOfAgriProducts.find({ isActive: true }).lean();

    const map = {};
    types.forEach((t) => (map[t._id] = { ...t, children: [] }));
    const roots = [];

    types.forEach((t) => {
      if (t.parentType) {
        map[t.parentType]?.children.push(map[t._id]);
      } else {
        roots.push(map[t._id]);
      }
    });

    res.status(200).json(roots);
  } catch (error) {
    console.error("Lỗi khi lấy cây loại sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi lấy cây loại sản phẩm." });
  }
};

module.exports = {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  getTypeTree,
  getAll,
};
