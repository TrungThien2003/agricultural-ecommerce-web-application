const Method = require("../models/method.model");
const getAllMethods = async (req, res) => {
  try {
    const methods = await Method.find();
    return res
      .status(200)
      .json({ message: "Lấy danh sách phương pháp thành công!", methods });
  } catch (error) {
    console.error("Lỗi khi lấy phương pháp:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách phương pháp." });
  }
};

const createMethod = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Tên phương pháp là bắt buộc." });
    }
    const existingMethod = await Method.findOne({ name });
    if (existingMethod) {
      return res
        .status(400)
        .json({ message: "Phương pháp với tên này đã tồn tại." });
    }
    const newMethod = new Method({ name, description });
    await newMethod.save();
    return res
      .status(201)
      .json({ message: "Tạo mới phương pháp thành công!", method: newMethod });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server khi tạo phương pháp." });
  }
};

module.exports = {
  getAllMethods,
  createMethod,
};
