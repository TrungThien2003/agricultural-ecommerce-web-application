const mongoose = require("mongoose");
const AgriProduct = require("../models/agriProduct.model");
const Provider = require("../models/provider.model");
const TypeOfAgriProduct = require("../models/typeOfAgriproduct.model");
const agriProductModel = require("../models/agriProduct.model");

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      category,
      standards,
      methods,
      sort,
    } = req.query;
    console.log("Query Params:", req.query);

    const filterConditions = {};
    if (!req.user || !req.user.isAdmin) {
      console.log("Luot bot di");
      filterConditions.isActive = true;
    }

    if (category) {
      const childTypes = await TypeOfAgriProduct.find(
        { parentType: category },
        "_id"
      ).lean();

      const childTypeIds = childTypes.map((type) => type._id);

      const allTypeIds = [category, ...childTypeIds];

      filterConditions.type = { $in: allTypeIds };
    }

    if (name) {
      filterConditions.name = { $regex: name, $options: "i" };
    }
    let standardsArray = Array.isArray(standards)
      ? standards
      : standards
      ? [standards]
      : [];
    if (standardsArray.length > 0) {
      filterConditions.standardOfProduct = { $in: standardsArray };
    }

    console.log("Standards Array:", filterConditions.standardOfProduct);

    let methodsArray = Array.isArray(methods)
      ? methods
      : methods
      ? [methods]
      : [];
    if (methodsArray.length > 0) {
      filterConditions.harvestMethod = { $in: methodsArray };
    }

    const sortOptions = {};
    if (sort === "best-selling") {
      sortOptions.sold = -1;
    } else if (sort === "price-asc") {
      sortOptions.averageCost = 1;
    } else if (sort === "price-desc") {
      sortOptions.averageCost = -1;
    } else if (sort === "hsd") {
      sortOptions.nearestExpiryDate = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    console.log("Filter Conditions:", filterConditions);
    const products = await AgriProduct.find(filterConditions)
      .populate("type", "name profitMargin")
      .populate("provider", "name")
      .populate("standardOfProduct", "name")
      .populate("_quantity")
      .populate("harvestMethod", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    const totalProducts = await AgriProduct.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalProducts / limitNum);

    const result = products.map((product) => {
      const obj = product.toObject({ virtuals: true });
      obj.totalQuantity = product.getTotalQuantity();
      return obj;
    });

    res.status(200).json({
      message: "Thành công",
      products: result,
      page: parseInt(page),
      limit: limitNum,
      totalPages,
      totalProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm." });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ." });
    }

    const product = await AgriProduct.findById(id)
      .populate("type", "name profitMargin")
      .populate("provider", "name")
      .populate("standardOfProduct", "name")
      .populate("_quantity")
      .populate("harvestMethod", "name");

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    const result = product.toObject({ virtuals: true });
    result.totalQuantity = product.getTotalQuantity();

    res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công.",
      product: result,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Lỗi khi lấy chi tiết sản phẩm." });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      unit,
      weight,
      type,
      images,
      provider,
      description,
      storageCondition,
      provinceOfOrigin,
      harvestSeason,
      harvestMethod,
      variants,
    } = req.body;

    if (!name || !unit || !type || !provider || !images) {
      return res.status(400).json({
        message:
          "Thiếu thông tin bắt buộc: name, unit, type, provider, images.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(type) ||
      !mongoose.Types.ObjectId.isValid(provider)
    ) {
      return res
        .status(400)
        .json({ message: "ID type hoặc provider không hợp lệ." });
    }

    const [foundType, foundProvider] = await Promise.all([
      TypeOfAgriProduct.findById(type),
      Provider.findById(provider),
    ]);

    if (!foundType)
      return res.status(404).json({ message: "Loại nông sản không tồn tại." });
    if (!foundProvider)
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại." });

    const product = new AgriProduct({
      name,
      unit,
      images,
      storageCondition: storageCondition || "",
      provinceOfOrigin: provinceOfOrigin || "",
      description: description || "",
      harvestSeason: harvestSeason || [],
      harvestMethod: harvestMethod || null,
      type,
      weight,
      provider,
      variants: variants || [],
    });

    const saved = await product.save();
    res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công", product: saved });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi tạo sản phẩm." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ." });
    }

    const existingProduct = await AgriProduct.findById(id);
    if (!existingProduct)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

    const {
      name,
      unit,
      type,
      weight,
      provider,
      averageCost,
      description,
      storageCondition,
      provinceOfOrigin,
      harvestSeason,
      harvestMethod,
      standardOfProduct,
      images,
      isActive,
      variants,
    } = req.body;

    if (type && !mongoose.Types.ObjectId.isValid(type))
      return res.status(400).json({ message: "Type ID không hợp lệ." });
    if (provider && !mongoose.Types.ObjectId.isValid(provider))
      return res.status(400).json({ message: "Provider ID không hợp lệ." });

    if (type) {
      const foundType = await TypeOfAgriProduct.findById(type);
      if (!foundType)
        return res
          .status(404)
          .json({ message: "Loại nông sản không tồn tại." });
    }
    if (provider) {
      const foundProvider = await Provider.findById(provider);
      if (!foundProvider)
        return res.status(404).json({ message: "Nhà cung cấp không tồn tại." });
    }

    existingProduct.set({
      name,
      unit,
      weight,
      type,
      provider,
      averageCost,
      description,
      storageCondition,
      provinceOfOrigin,
      harvestSeason,
      harvestMethod,
      standardOfProduct,
      images,
      isActive,
      variants,
    });

    const updatedProduct = await existingProduct.save();
    res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "ID không hợp lệ." });

    await AgriProduct.findByIdAndUpdate(id, { isActive: false });
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
};

const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Danh sách ID không hợp lệ" });
    }
    const products = await agriProductModel.find({
      _id: { $in: ids },
    });
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server Node.js" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByIds,
};
