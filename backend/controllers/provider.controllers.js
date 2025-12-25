const Provider = require("../models/provider.model.js");

const getAllProviders = async (req, res) => {
  try {
    const { name } = req.query;
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    const providers = await Provider.find(filter).sort({ createdAt: -1 });
    res.status(200).json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ message: "Error fetching providers" });
  }
};

const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Không tim thấy nhà" });
    }
    res.status(200).json(provider);
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ message: "Error fetching provider" });
  }
};

const createProvider = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ các trường cần thiết." });
    }
    const existingProvider = await Provider.findOne({ name });
    if (existingProvider) {
      return res
        .status(400)
        .json({ message: "Nhà cung cấp với tên này đã tồn tại." });
    }
    const newProvider = new Provider(req.body);
    await newProvider.save();
    res.status(201).json({
      message: "Tạo mới nhà cung cấp thành công!",
      provider: newProvider,
    });
  } catch (error) {
    console.error("Error creating provider:", error);
    res.status(500).json({ message: "Error creating provider" });
  }
};

const updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!provider)
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    res.status(200).json({
      message: "Cập nhật thông tin nhà cung cấp thành công",
      provider,
    });
  } catch (error) {
    console.error("Error updating provider:", error);
    res.status(500).json({ message: "Error updating provider" });
  }
};

const deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!provider)
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp." });
    res
      .status(200)
      .json({ message: "Đã xóa nhà cung cấp thành công", provider });
  } catch (error) {
    console.error("Error deleting provider:", error);
    res.status(500).json({ message: "Error deleting provider" });
  }
};

module.exports = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
};
