import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import ModalForm from "../../components/ModalForm";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

// Giới hạn sản phẩm cố định cho mỗi lần tải
const PRODUCT_LIMIT = 8;

export default function ProductManager({ search }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [products, setProducts] = useState([]);

  // State quản lý phân trang và trạng thái tải
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user);

  // State quản lý hiển thị nút Reset/Cuộn
  const [showResetButton, setShowResetButton] = useState(false);
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);

  // State dữ liệu tham chiếu
  const [types, setTypes] = useState([]);
  const [providers, setProviders] = useState([]);
  const [standards, setStandards] = useState([]);
  const [harvestMethods, setHarvestMethod] = useState([]);
  const [variants, setVariants] = useState([]);

  const fetchProducts = async (
    page = 1,
    isLoadMore = false,
    searchTerm = ""
  ) => {
    setIsLoading(true);
    try {
      const querySearch = searchTerm !== undefined ? searchTerm : search;

      const res = await axios.get(
        `http://localhost:5000/api/products?page=${page}&limit=${PRODUCT_LIMIT}&name=${
          querySearch || ""
        }`
      );

      if (isLoadMore) {
        setProducts((prevProducts) => [...prevProducts, ...res.data.products]);
      } else {
        setProducts(res.data.products);
      }

      setCurrentPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Lỗi fetch products:", err);
      toast.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);

      if (shouldScrollToTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setShouldScrollToTop(false);
      }
    }
  };

  useEffect(() => {
    if (!user || !user.access_token) return;

    const timeoutId = setTimeout(() => {
      fetchProducts(1, false, search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, user?.access_token]);
  useEffect(() => {
    if (!user || !user.access_token) return;
    const fetchReferenceData = async () => {
      try {
        const [typesRes, providersRes, standardsRes, methodsRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/types"),
            axios.get("http://localhost:5000/api/providers"),
            axios.get("http://localhost:5000/api/standards"),
            axios.get("http://localhost:5000/api/methods"),
          ]);

        setTypes(typesRes.data.types || []);
        setProviders(providersRes.data || []);
        setStandards(standardsRes.data.standards || []);
        setHarvestMethod(methodsRes.data.methods || []);
      } catch (err) {
        console.error("Lỗi fetch reference data:", err);
      }
    };

    fetchReferenceData();
  }, [user?.access_token]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowResetButton(true);
      } else {
        setShowResetButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      fetchProducts(currentPage + 1, true, search);
    }
  };

  const resetToPageOne = async () => {
    setShouldScrollToTop(true);
    await fetchProducts(1, false, search);
  };

  const handleSave = async (formData) => {
    try {
      const payload = { ...formData, variants };
      if (selected) {
        await axios.put(
          `http://localhost:5000/api/products/${selected._id}`,
          payload
        );
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await axios.post("http://localhost:5000/api/products", payload);
        toast.success("Thêm sản phẩm mới thành công!");
      }
      setShowModal(false);
      setSelected(null);
      setVariants([]);
      await fetchProducts(currentPage, false, search);
    } catch (err) {
      console.error("Lỗi lưu sản phẩm:", err);
      toast.error("Có lỗi xảy ra khi lưu sản phẩm");
    }
  };

  const handleActualDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      await fetchProducts(currentPage, false, search);
      toast.success("Xóa sản phẩm thành công!");
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  const ConfirmDeleteToast = ({ closeToast, id, name }) => (
    <div className="p-2">
      <p className="font-semibold text-base mb-2 text-gray-800">
        Bạn có chắc muốn xóa sản phẩm này?
      </p>
      <p className="text-sm italic mb-3 text-gray-600 font-medium">
        Sản phẩm: <strong>{name}</strong>
      </p>
      <div className="flex justify-end gap-2 mt-2">
        <button
          className="px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400 transition"
          onClick={closeToast}
        >
          Hủy
        </button>
        <button
          className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition"
          onClick={() => {
            handleActualDelete(id);
            closeToast();
          }}
        >
          Xóa ngay
        </button>
      </div>
    </div>
  );

  const handleDelete = (item) => {
    toast.warn(
      ({ closeToast }) => (
        <ConfirmDeleteToast
          closeToast={closeToast}
          id={item._id}
          name={item.name}
        />
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
        pauseOnHover: true,
        style: {
          backgroundColor: "#fff",
          color: "#1f2937",
          borderRadius: "8px",
        },
      }
    );
  };

  const handleEdit = (item) => {
    const normalized = {
      ...item,
      type: item.type?._id || item.type,
      provider: item.provider?._id || item.provider,
      standardOfProduct:
        item?.standardOfProduct?._id || item?.standardOfProduct,
      harvestMethod: item?.harvestMethod?._id || item?.harvestMethod,
    };
    setSelected(normalized);
    setVariants(item.variants || []);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-green-700">
          🌾 Quản lý sản phẩm nông sản
        </h2>
        <button
          onClick={() => {
            setShowModal(true);
            setVariants([]);
            setSelected(null);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {search && (
        <div className="mb-4 text-gray-600 italic">
          Đang hiển thị kết quả cho từ khóa:{" "}
          <span className="font-bold text-green-700">"{search}"</span>
        </div>
      )}

      <DataTable
        data={products}
        columns={[
          {
            key: "images",
            label: "Ảnh",
            render: (imgs) =>
              imgs && imgs.length > 0 ? (
                <img
                  src={imgs[0]}
                  alt="product"
                  className="w-16 h-16 object-cover rounded-md border"
                />
              ) : (
                <span className="text-gray-400 italic">Chưa có</span>
              ),
          },
          { key: "name", label: "Tên sản phẩm" },
          { key: "unit", label: "Đơn vị" },
          { key: "weight", label: "Trọng lượng" },
          { key: "provinceOfOrigin", label: "Xuất xứ" },
          {
            key: "harvestMethod",
            label: "Phương pháp trồng",
            render: (v) => (typeof v === "object" ? v?.name : v),
          },
          {
            key: "variants",
            label: "Biến thể",
            render: (vars) =>
              vars && vars.length > 0
                ? vars
                    .map((v) => `${v.name} (${v.unit}, ${v.weight || 0})`)
                    .join(", ")
                : "-",
          },
          {
            key: "isActive",
            label: "Trạng thái",
            render: (v) => (
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  v
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {v ? "Hoạt động" : "Ẩn"}
              </span>
            ),
          },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="flex justify-center mt-6 pb-10">
        {isLoading ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Đang tải...</span>
          </div>
        ) : currentPage < totalPages ? (
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition shadow-md"
          >
            Xem thêm sản phẩm
          </button>
        ) : (
          products.length > 0 && (
            <p className="text-gray-500 italic px-6 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              Đã tải hết tất cả sản phẩm.
            </p>
          )
        )}

        {!isLoading && products.length === 0 && (
          <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
        )}
      </div>

      {/* NÚT TẢI LẠI TRANG ĐẦU (FLOATING) */}
      {showResetButton && (
        <button
          onClick={resetToPageOne}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-300 z-50 flex items-center justify-center"
          title="Tải lại trang đầu tiên"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m15.356-2h-.582m0 0H9m-5 0V4m15 0a9 9 0 01-16.7 5"
            ></path>
          </svg>
        </button>
      )}

      {showModal && (
        <ModalForm
          title={selected ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          onClose={() => {
            setShowModal(false);
            setSelected(null);
            setVariants([]);
          }}
          onSave={handleSave}
          defaultValues={selected || {}}
          fields={[
            {
              key: "name",
              label: "Tên sản phẩm",
              type: "text",
              required: true,
            },
            { key: "unit", label: "Đơn vị", type: "text", required: true },
            {
              key: "weight",
              label: "Trọng lượng",
              type: "number",
            },
            { key: "provinceOfOrigin", label: "Xuất xứ", type: "text" },
            {
              key: "storageCondition",
              label: "Điều kiện bảo quản",
              type: "textarea",
            },
            {
              key: "harvestMethod",
              label: "Phương pháp thu hoạch",
              type: "select",
              options: harvestMethods.map((h) => ({
                label: h.name || h,
                value: h._id || h,
              })),
            },
            {
              key: "harvestSeason",
              label: "Mùa vụ",
              type: "custom",
              render: (value, setValue) => (
                <div className="flex gap-2">
                  <select
                    value={value?.[0]?.min || ""}
                    onChange={(e) =>
                      setValue([
                        { ...(value?.[0] || {}), min: +e.target.value },
                      ])
                    }
                    className="border rounded p-2 flex-1"
                  >
                    <option value="">Bắt đầu</option>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tháng {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    value={value?.[0]?.max || ""}
                    onChange={(e) =>
                      setValue([
                        { ...(value?.[0] || {}), max: +e.target.value },
                      ])
                    }
                    className="border rounded p-2 flex-1"
                  >
                    <option value="">Kết thúc</option>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tháng {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              ),
            },
            {
              key: "type",
              label: "Loại sản phẩm",
              type: "select",
              required: true,
              options: types.map((t) => ({ label: t.name, value: t._id })),
            },
            {
              key: "provider",
              label: "Nhà cung cấp",
              type: "select",
              required: true,
              options: providers.map((p) => ({ label: p.name, value: p._id })),
            },
            {
              key: "standardOfProduct",
              label: "Tiêu chuẩn sản phẩm",
              type: "select",
              options: standards.map((s) => ({ label: s.name, value: s._id })),
            },
            {
              key: "images",
              label: "Ảnh sản phẩm",
              type: "file",
              multiple: true,
              accept: "image/*",
            },
            { key: "description", label: "Mô tả sản phẩm", type: "textarea" },
            { key: "isActive", label: "Trạng thái", type: "checkbox" },

            {
              key: "variants",
              label: "Biến thể sản phẩm",
              type: "custom",
              render: () => (
                <div className="my-4 max-h-[60vh] overflow-y-auto p-3 border border-gray-200 rounded bg-gray-50">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center mb-2 p-2 bg-white rounded shadow-sm"
                    >
                      <input
                        type="text"
                        placeholder="Tên biến thể"
                        value={v.name}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, name: e.target.value }
                                : item
                            )
                          )
                        }
                        className="border p-2 rounded flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Đơn vị"
                        value={v.unit}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, unit: e.target.value }
                                : item
                            )
                          )
                        }
                        className="border p-2 rounded w-20"
                      />
                      <input
                        type="number"
                        placeholder="Trọng lượng"
                        value={v.weight || ""}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, weight: +e.target.value }
                                : item
                            )
                          )
                        }
                        className="border p-2 rounded w-24"
                      />
                      <label className="flex items-center gap-1 text-sm select-none">
                        <input
                          type="checkbox"
                          checked={v.isActive}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, isActive: e.target.checked }
                                  : item
                              )
                            )
                          }
                        />
                        Hoạt động
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setVariants((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Xóa biến thể"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setVariants([
                        ...variants,
                        { name: "", unit: "", weight: null, isActive: true },
                      ])
                    }
                    className="w-full bg-dashed border-2 border-green-300 text-green-700 px-4 py-2 rounded mt-2 hover:bg-green-50 transition"
                  >
                    + Thêm biến thể
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
