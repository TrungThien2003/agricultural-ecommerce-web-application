import React, { useState, useEffect, useMemo } from "react";
import ModalForm from "../../components/ModalForm";
import { Plus, Trash2, Loader2 } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5000/api";

const formatProductSpecs = (unit, weight) => {
  const weightValue = parseFloat(weight);

  if (!unit || isNaN(weightValue) || weightValue <= 0) {
    if (weight) return `${weight} kg`;
    return "N/A kg";
  }

  if (weightValue >= 1) {
    return `${weightValue.toFixed(2)} ${unit} (kg)`;
  } else {
    const grams = (weightValue * 1000).toFixed(0);
    return `${grams} ${unit} (gram)`;
  }
};

const initialDetail = {
  product: "",
  variant: "",
  productName: "",
  variantName: "",
  idBatchCode: `BATCH-${Date.now().toString().slice(-6)}`,
  unitCost: 0,
  quantityImported: 0,
  harvestDate: "",
  expiryDate: "",
  note: "",
};

export default function WarehouseManager() {
  const currentUser = useSelector((state) => state.user);

  const [creatorNameInModal, setCreatorNameInModal] = useState(
    currentUser?.name || "Đang tải..."
  );

  const [notes, setNotes] = useState([]);
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalMode, setModalMode] = useState("view");

  const [newNote, setNewNote] = useState({
    provider: "",
    dateOfNote: new Date().toISOString().split("T")[0],
    importedBy: "",
    details: [],
    totalCost: 0,
  });

  useEffect(() => {
    if (currentUser?.id && !newNote.importedBy && !newNote._id) {
      setNewNote((prev) => ({ ...prev, importedBy: currentUser.id }));
    }
  }, [currentUser, newNote.importedBy, newNote._id]);

  const [newDetail, setNewDetail] = useState(initialDetail);
  const [detailError, setDetailError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [provRes, prodRes, noteRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/providers`),
          axios.get(`${API_BASE_URL}/products?limit=1000`),
          axios.get(`${API_BASE_URL}/inventory/notes`),
        ]);
        setProviders(provRes.data || []);
        setProducts(prodRes.data.products || []);
        setNotes(noteRes.data.notes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!newNote.provider) return [];
    return products.filter((p) => p.provider._id === newNote.provider);
  }, [newNote.provider, products]);

  const productVariants = useMemo(() => {
    if (!newDetail.product) return [];
    const prod = filteredProducts.find((p) => p._id === newDetail.product);
    return prod?.variants || [];
  }, [newDetail.product, filteredProducts]);

  const openDetailModal = async (note, mode = "view") => {
    setModalMode(mode);
    setOpenModal(true);
    setSelectedNote(note);

    setCreatorNameInModal(note.importedBy?.fullname || "Đang tải...");

    try {
      const res = await axios.get(
        `${API_BASE_URL}/inventory/notes/${note._id}`
      );

      const fetched = res.data.note;

      setCreatorNameInModal(fetched.importedBy?.fullname || "Không rõ");

      const detailsWithNames = fetched.details.map((detail) => {
        const prod = detail.product;
        let vName = "";
        let specsDisplay = "";

        if (prod && prod.variants && detail.variant) {
          const variantObj = prod.variants.find(
            (v) => v._id === detail.variant
          );
          if (variantObj) {
            vName = variantObj.name;
          }
        }

        if (!detail.variant) {
          specsDisplay = formatProductSpecs(prod?.unit, prod?.weight);
        }

        return {
          ...detail,
          product: prod?._id || prod,
          variant: detail.variant,
          productName: prod?.name || "Lỗi SP",
          variantName: vName,
          productUnit: prod?.unit,
          productWeight: prod?.weight,
          specsDisplay: specsDisplay,
          expiryDate: detail.expiryDate ? detail.expiryDate.split("T")[0] : "",
          harvestDate: detail.harvestDate
            ? detail.harvestDate.split("T")[0]
            : "",
        };
      });

      setNewNote({
        ...fetched,
        dateOfNote: fetched.dateOfNote ? fetched.dateOfNote.split("T")[0] : "",
        details: detailsWithNames,
        provider: fetched.provider?._id || fetched.provider,
        importedBy: fetched.importedBy?._id || fetched.importedBy,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDetail = () => {
    setDetailError("");
    if (!newDetail.product) return setDetailError("Vui lòng chọn sản phẩm.");
    if (newDetail.quantityImported <= 0) return setDetailError("Số lượng > 0");
    if (newDetail.unitCost <= 0) return setDetailError("Giá > 0");
    if (!newDetail.expiryDate) return setDetailError("Vui lòng nhập HSD");

    if (newNote.details.some((d) => d.idBatchCode === newDetail.idBatchCode))
      return setDetailError("Batch code trùng trong phiếu.");

    const prod = filteredProducts.find((p) => p._id === newDetail.product);
    const variant = productVariants.find((v) => v._id === newDetail.variant);

    let specsDisplay = "";
    if (!newDetail.variant) {
      specsDisplay = formatProductSpecs(prod?.unit, prod?.weight);
    }

    setNewNote((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        {
          ...newDetail,
          _id: `temp${Date.now()}`,
          productName: prod?.name,
          variantName: variant?.name || "",
          productUnit: prod?.unit,
          productWeight: prod?.weight,
          specsDisplay: specsDisplay,
        },
      ],
    }));

    setNewDetail({
      ...initialDetail,
      idBatchCode: `BATCH-${Date.now().toString().slice(-6)}`,
    });
  };

  const totalCost = useMemo(() => {
    return newNote.details.reduce(
      (sum, d) => sum + d.unitCost * d.quantityImported,
      0
    );
  }, [newNote.details]);

  const handleSaveNote = async () => {
    if (
      !newNote.provider ||
      !newNote.dateOfNote ||
      newNote.details.length === 0
    ) {
      toast.warn("Vui lòng nhập đầy đủ thông tin phiếu và chi tiết sản phẩm.");
      return;
    }

    if (!currentUser || !currentUser.id) {
      toast.error(
        "Phiên đăng nhập hết hạn hoặc không tìm thấy thông tin người dùng."
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...newNote,
        totalCost: totalCost,
        importedBy: newNote.importedBy || currentUser.id,

        details: newNote.details.map(
          ({
            productName,
            variantName,
            productUnit,
            productWeight,
            specsDisplay,
            ...d
          }) => ({
            ...d,
            variant: d.variant || null,
          })
        ),
      };

      let res;
      if (modalMode === "edit" && newNote._id) {
        res = await axios.put(
          `${API_BASE_URL}/inventory/note/${newNote._id}`,
          payload
        );
      } else {
        res = await axios.post(`${API_BASE_URL}/inventory/note`, payload);
      }

      const noteRes = await axios.get(`${API_BASE_URL}/inventory/notes`);
      setNotes(noteRes.data.notes || []);

      setOpenModal(false);
      toast.success("Lưu phiếu thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu phiếu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phiếu này?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/inventory/note/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
      toast.success("Xóa thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        📦 Quản lý Phiếu Nhập Kho
      </h2>
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="flex justify-end mb-4 gap-3">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          onClick={() => {
            setCreatorNameInModal(currentUser?.name || "Đang tải...");
            setModalMode("edit");
            setOpenModal(true);
            setNewNote({
              provider: "",
              details: [],
              dateOfNote: new Date().toISOString().split("T")[0],
              importedBy: currentUser?.id || "",
              totalCost: 0,
            });
          }}
        >
          <Plus size={16} className="inline mr-1" /> Thêm phiếu nhập mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        </div>
      ) : (
        <table className="w-full border rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Nhà cung cấp</th>
              <th className="p-2">Ngày nhập</th>
              <th className="p-2">Người nhập</th>
              <th className="p-2 text-right">Tổng tiền</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {notes.filter(Boolean).map((note) => (
              <tr key={note._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{note.provider?.name}</td>
                <td className="p-2 text-center">
                  {new Date(note.dateOfNote).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-2 text-center">{note.importedBy?.fullname}</td>
                <td className="p-2 text-right">
                  {note.totalCost.toLocaleString("vi-VN")} ₫
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => openDetailModal(note, "view")}
                  >
                    Xem
                  </button>
                  <button
                    className="text-yellow-600 hover:underline"
                    onClick={() => openDetailModal(note, "edit")}
                  >
                    Sửa
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDeleteNote(note._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {openModal && (
        <ModalForm
          open={openModal}
          title={
            modalMode === "view"
              ? "Chi tiết phiếu nhập"
              : newNote._id
              ? "Chỉnh sửa phiếu nhập"
              : "Thêm phiếu nhập mới"
          }
          onClose={() => {
            setOpenModal(false);
            setNewNote({
              provider: "",
              details: [],
              dateOfNote: new Date().toISOString().split("T")[0],
              importedBy: currentUser?.id || "",
              totalCost: 0,
            });
          }}
          onSave={modalMode === "view" ? null : handleSaveNote}
          saveText={isSaving ? "Đang lưu..." : "Lưu phiếu"}
          isSaving={isSaving}
          showSaveButton={modalMode !== "view"}
        >
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-gray-50">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Nhà cung cấp (*)
                </label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={newNote.provider}
                  onChange={(e) =>
                    setNewNote({
                      ...newNote,
                      provider: e.target.value,
                      details: [],
                    })
                  }
                  disabled={modalMode === "view"}
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Ngày nhập (*)
                </label>
                <input
                  type="date"
                  className="border rounded-lg p-2 w-full"
                  value={newNote.dateOfNote}
                  onChange={(e) =>
                    setNewNote({ ...newNote, dateOfNote: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />
              </div>
              <div className="col-span-2 text-sm text-gray-500">
                Người tạo phiếu:{" "}
                <span className="font-semibold text-gray-800">
                  {newNote._id
                    ? creatorNameInModal
                    : currentUser?.name || "Đang tải..."}
                </span>
              </div>
            </div>

            {modalMode !== "view" && (
              <div className="border rounded-lg p-3 mt-2 bg-blue-50">
                <h4 className="font-semibold text-blue-700 mb-3 border-b pb-1">
                  Thêm chi tiết sản phẩm
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="font-medium text-gray-700 block mb-1">
                      Sản phẩm (*)
                    </label>
                    <select
                      className="border rounded-lg p-2 w-full"
                      value={newDetail.product}
                      onChange={(e) =>
                        setNewDetail({
                          ...newDetail,
                          product: e.target.value,
                          variant: "",
                        })
                      }
                      disabled={!newNote.provider}
                    >
                      <option value="">
                        -- Chọn sản phẩm từ NCC đã chọn --
                      </option>
                      {filteredProducts.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {productVariants.length > 0 && (
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block mb-1">
                        Biến thể
                      </label>
                      <select
                        className="border rounded-lg p-2 w-full"
                        value={newDetail.variant}
                        onChange={(e) =>
                          setNewDetail({
                            ...newDetail,
                            variant: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Sản phẩm gốc --</option>
                        {productVariants.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="font-medium text-gray-700 block mb-1">
                      Số lượng nhập (*)
                    </label>
                    <input
                      type="number"
                      className="border rounded-lg p-2 w-full"
                      placeholder="Nhập số lượng > 0"
                      value={newDetail.quantityImported || ""}
                      onChange={(e) =>
                        setNewDetail({
                          ...newDetail,
                          quantityImported: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 block mb-1">
                      Giá nhập 1 đơn vị (*)
                    </label>
                    <input
                      type="number"
                      className="border rounded-lg p-2 w-full"
                      placeholder="Giá nhập (VNĐ) > 0"
                      value={newDetail.unitCost || ""}
                      onChange={(e) =>
                        setNewDetail({
                          ...newDetail,
                          unitCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-gray-700 block mb-1">
                      Ngày thu hoạch
                    </label>
                    <input
                      type="date"
                      className="border rounded-lg p-2 w-full"
                      value={newDetail.harvestDate}
                      onChange={(e) =>
                        setNewDetail({
                          ...newDetail,
                          harvestDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 block mb-1">
                      Hạn sử dụng (HSD) (*)
                    </label>
                    <input
                      type="date"
                      className="border rounded-lg p-2 w-full"
                      value={newDetail.expiryDate}
                      onChange={(e) =>
                        setNewDetail({
                          ...newDetail,
                          expiryDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <span className="col-span-2 text-red-600 font-medium text-sm">
                    {detailError}
                  </span>
                  <button
                    type="button"
                    className="col-span-2 bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                    onClick={handleAddDetail}
                    disabled={!newNote.provider || !newDetail.product}
                  >
                    <Plus size={16} /> Thêm vào danh sách nhập
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">
                Danh sách sản phẩm nhập
              </h4>
              <table className="w-full border rounded-lg text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Sản phẩm</th>
                    <th className="p-2">Biến thể / Quy cách</th>
                    <th className="p-2">SL nhập</th>
                    <th className="p-2 text-right">Giá nhập</th>
                    <th className="p-2">Ngày TH</th>
                    <th className="p-2">HSD</th>
                    {modalMode !== "view" && <th className="p-2">Xóa</th>}
                  </tr>
                </thead>
                <tbody>
                  {newNote.details.length === 0 ? (
                    <tr>
                      <td
                        colSpan={modalMode !== "view" ? 7 : 6}
                        className="p-2 text-center text-gray-500 italic"
                      >
                        Chưa có sản phẩm nào được thêm vào phiếu.
                      </td>
                    </tr>
                  ) : (
                    newNote.details.map((d) => (
                      <tr key={d._id} className="border-t hover:bg-gray-50">
                        <td className="p-2 font-medium">{d.productName}</td>
                        <td className="p-2 text-center text-gray-600">
                          {d.variantName ? d.variantName : d.specsDisplay}
                        </td>
                        <td className="p-2 text-center">
                          {d.quantityImported}
                        </td>
                        <td className="p-2 text-right">
                          {d.unitCost.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="p-2 text-center">{d.harvestDate}</td>
                        <td className="p-2 text-center">{d.expiryDate}</td>
                        {modalMode !== "view" && (
                          <td className="p-2 text-center">
                            <button
                              onClick={() =>
                                setNewNote({
                                  ...newNote,
                                  details: newNote.details.filter(
                                    (x) => x._id !== d._id
                                  ),
                                })
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {modalMode !== "view" && (
              <div className="mt-4 flex justify-end text-xl font-bold border-t pt-2">
                <span className="text-gray-700 mr-2">TỔNG TIỀN:</span>
                <span className="text-red-600">
                  {totalCost.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            )}
          </div>
        </ModalForm>
      )}
    </div>
  );
}
