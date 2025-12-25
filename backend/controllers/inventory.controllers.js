const GoodsReceivedNote = require("../models/goodsReceivedNote.model");
const mongoose = require("mongoose");
const GoodsReceivedDetail = require("../models/goodsReceivedDetail.model");

const getNotes = async (req, res) => {
  try {
    const notes = await GoodsReceivedNote.find()
      .populate("provider", "name")
      .populate("importedBy", "fullname")
      .sort({ dateOfNote: -1 });
    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách phiếu nhập" });
  }
};
const createNote = async (req, res) => {
  const { provider, dateOfNote, importedBy, details } = req.body;

  if (!provider || !dateOfNote || !importedBy) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ: provider, dateOfNote, importedBy",
    });
  }
  if (!details || details.length === 0) {
    return res
      .status(400)
      .json({ message: "Phiếu nhập phải có ít nhất 1 chi tiết" });
  }

  const session = await mongoose.startSession();
  let savedNote;
  let savedDetails;

  try {
    session.startTransaction();

    const note = new GoodsReceivedNote({
      provider,
      dateOfNote,
      importedBy,
      totalCost: 0,
      details: [],
    });
    await note.save({ session });

    let totalCost = 0;
    const detailDocs = details.map((d) => {
      const { _id, ...restOfDetail } = d;
      const quantity = d.quantityImported || 0;
      const cost = d.unitCost || 0;
      totalCost += quantity * cost;

      return {
        ...restOfDetail,
        goodsReceivedNote: note._id,
        quantityRemaining: quantity,
      };
    });

    savedDetails = await GoodsReceivedDetail.insertMany(detailDocs, {
      session,
    });

    note.details = savedDetails.map((d) => d._id);
    note.totalCost = totalCost;
    savedNote = await note.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("Lỗi khi nhập kho (đã rollback):", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Lỗi trùng lặp dữ liệu, có thể Mã Lô (idBatchCode) đã tồn tại.",
      });
    }
    // Lỗi chung
    return res.status(500).json({ message: "Lỗi server khi nhập kho" });
  } finally {
    session.endSession();
  }

  if (savedDetails) {
    try {
      const productVariantPairs = savedDetails.map((d) => ({
        productId: d.product,
        variantId: d.variant,
      }));

      await GoodsReceivedDetail.updateAgriProductStatsBulk(productVariantPairs);
    } catch (statsError) {
      console.error(
        "Tạo phiếu thành công, nhưng lỗi khi cập nhật stats:",
        statsError
      );
    }
  }
  res.status(201).json({
    message: "Nhập kho thành công!",
    note: savedNote,
    details: savedDetails,
  });
};

const getDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await GoodsReceivedNote.findById(id)
      .populate("provider", "name")
      .populate("importedBy", "fullname")
      .populate({
        path: "details",
        populate: [
          {
            path: "product",
            select: "_id name sellingPrice unit weight variants",
          },
        ],
      });
    if (!note)
      return res.status(404).json({ error: "Phiếu nhập không tồn tại" });
    res.json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết phiếu nhập" });
  }
};

const deleteNote = async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const note = await GoodsReceivedNote.findById(id).session(session);
    if (!note) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Phiếu nhập không tồn tại" });
    }

    const details = await GoodsReceivedDetail.find({
      _id: { $in: note.details },
    })
      .session(session)
      .lean();

    const productVariantPairs = details.map((d) => {
      return { productId: d.product, variantId: d.variant || null };
    });

    await GoodsReceivedDetail.deleteMany(
      { _id: { $in: note.details } },
      { session }
    );

    await note.deleteOne({ session });

    await session.commitTransaction();

    if (productVariantPairs.length > 0) {
      await GoodsReceivedDetail.updateAgriProductStatsBulk(productVariantPairs);
    }

    res.json({ message: "Xóa phiếu nhập thành công" });
  } catch (err) {
    console.error("Lỗi transaction khi xóa phiếu nhập:", err);
    await session.abortTransaction();
    res
      .status(500)
      .json({ error: "Lỗi khi xóa phiếu nhập, dữ liệu đã được rollback" });
  } finally {
    session.endSession();
  }
};

const removeDetailFromNote = async (noteId, detailId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const note = await GoodsReceivedNote.findById(noteId).session(session);
    if (!note) throw new Error("Phiếu nhập không tồn tại");

    const detail = await GoodsReceivedDetail.findById(detailId).session(
      session
    );
    if (!detail) throw new Error("Chi tiết nhập không tồn tại");

    await detail.deleteOne({ session });

    note.details = note.details.filter((id) => id.toString() !== detailId);

    const remainingDetails = await GoodsReceivedDetail.find({
      _id: { $in: note.details },
    }).session(session);
    note.totalCost = remainingDetails.reduce(
      (sum, d) => sum + d.unitCost * d.quantityImported,
      0
    );

    await note.save({ session });

    await session.commitTransaction();

    await GoodsReceivedDetail.updateAgriProductStatsBulk([
      { productId: detail.product, variantId: detail.variant || null },
    ]);

    return note;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// Cập nhật phiếu nhập
const updateNote = async (req, res) => {
  const { id } = req.params;
  const { provider, dateOfNote, importedBy, details } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const note = await GoodsReceivedNote.findById(id).session(session);
    if (!note) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Phiếu nhập không tồn tại" });
    }

    if (provider) note.provider = provider;
    if (dateOfNote) note.dateOfNote = dateOfNote;
    if (importedBy) note.importedBy = importedBy;

    const productVariantPairs = [];

    if (details && details.length > 0) {
      const newDetailIds = [];
      for (const d of details) {
        if (d._id && mongoose.Types.ObjectId.isValid(d._id)) {
          const existingDetail = await GoodsReceivedDetail.findById(
            d._id
          ).session(session);
          if (!existingDetail) continue;

          existingDetail.unitCost = d.unitCost ?? existingDetail.unitCost;
          existingDetail.quantityImported =
            d.quantityImported ?? existingDetail.quantityImported;
          existingDetail.quantityRemaining =
            d.quantityImported ?? existingDetail.quantityRemaining;
          existingDetail.harvestDate =
            d.harvestDate ?? existingDetail.harvestDate;
          existingDetail.expiryDate = d.expiryDate ?? existingDetail.expiryDate;
          existingDetail.note = d.note ?? existingDetail.note;
          await existingDetail.save({ session });

          productVariantPairs.push({
            productId: existingDetail.product,
            variantId: existingDetail.variant || null,
          });
          newDetailIds.push(existingDetail._id);
        } else {
          const { _id, ...newDetailData } = d;
          const newDetail = await GoodsReceivedDetail.create(
            [
              {
                ...newDetailData,
                goodsReceivedNote: note._id,
                quantityRemaining: d.quantityImported,
              },
            ],
            { session }
          );

          newDetailIds.push(newDetail[0]._id);
          productVariantPairs.push({
            productId: d.product,
            variantId: d.variant || null,
          });
        }
      }
      note.details = newDetailIds;
    }

    const allDetails = await GoodsReceivedDetail.find({
      _id: { $in: note.details },
    }).session(session);
    note.totalCost = allDetails.reduce(
      (sum, d) => sum + d.unitCost * d.quantityImported,
      0
    );

    await note.save({ session });
    await session.commitTransaction();

    if (productVariantPairs.length > 0) {
      await GoodsReceivedDetail.updateAgriProductStatsBulk(productVariantPairs);
    }
    const updatedNote = await GoodsReceivedNote.findById(note._id).populate(
      "details"
    );

    res.json({ message: "Cập nhật phiếu nhập thành công", updatedNote });
  } catch (err) {
    console.error("Lỗi khi cập nhật phiếu nhập:", err);
    await session.abortTransaction();
    res.status(500).json({ message: "Cập nhật phiếu nhập thất bại" });
  } finally {
    session.endSession();
  }
};
const updateDetail = async (req, res) => {
  const { detailId } = req.params;
  const {
    unitCost,
    quantityImported,
    quantityRemaining,
    harvestDate,
    expiryDate,
    note,
  } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const detail = await GoodsReceivedDetail.findById(detailId).session(
      session
    );
    if (!detail) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Chi tiết nhập không tồn tại" });
    }

    const note = await GoodsReceivedNote.findById(
      detail.goodsReceivedNote
    ).session(session);
    if (!note) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Phiếu nhập chứa chi tiết không tồn tại" });
    }

    if (unitCost !== undefined) detail.unitCost = unitCost;
    if (quantityImported !== undefined)
      detail.quantityImported = quantityImported;
    if (quantityRemaining !== undefined)
      detail.quantityRemaining = quantityRemaining;
    if (harvestDate !== undefined) detail.harvestDate = harvestDate;
    if (expiryDate !== undefined) detail.expiryDate = expiryDate;
    if (note !== undefined) detail.note = note;

    await detail.save({ session });

    const allDetails = await GoodsReceivedDetail.find({
      _id: { $in: note.details },
    }).session(session);

    note.totalCost = allDetails.reduce(
      (sum, d) => sum + d.unitCost * d.quantityImported,
      0
    );

    await note.save({ session });

    await session.commitTransaction();

    await GoodsReceivedDetail.updateAgriProductStatsBulk([
      { productId: detail.product, variantId: detail.variant || null },
    ]);

    res.json({ message: "Cập nhật chi tiết nhập thành công", detail });
  } catch (err) {
    await session.abortTransaction();
    console.error("Lỗi khi cập nhật chi tiết nhập:", err);
    res.status(500).json({ message: "Cập nhật chi tiết nhập thất bại" });
  } finally {
    session.endSession();
  }
};

module.exports = {
  createNote,
  getNotes,
  getDetails,
  deleteNote,
  removeDetailFromNote,
  updateNote,
  updateDetail,
};
