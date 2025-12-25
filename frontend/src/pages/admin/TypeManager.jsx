import React, { useEffect, useState, useMemo } from "react";
import DataTable from "../../components/DataTable";
import ModalForm from "../../components/ModalForm";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Search } from "lucide-react"; // Import icon nếu muốn đẹp hơn (tùy chọn)

import "react-toastify/dist/ReactToastify.css";
export default function TypeManager({ search }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [types, setTypes] = useState([]);

  const fetchTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/types/all");
      const data = res.data;

      if (!data?.types || !Array.isArray(data.types)) {
        setTypes([]);
        return;
      }

      setTypes(data.types);
    } catch (err) {
      console.error("Lỗi khi tải loại nông sản:", err);
      toast.error("Không thể tải danh sách loại nông sản.");
      setTypes([]);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const filteredTypes = useMemo(() => {
    if (!search) return types;

    const lowerSearch = search.toLowerCase().trim();

    return types.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(lowerSearch);
      const matchParent = item.parentType?.name
        ?.toLowerCase()
        .includes(lowerSearch);

      return matchName || matchParent;
    });
  }, [types, search]);
  const handleSave = async (data) => {
    try {
      if (selected) {
        await axios.put(
          `http://localhost:5000/api/types/${selected._id}`,
          data
        );
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post(`http://localhost:5000/api/types`, data);
        toast.success("Thêm mới thành công!");
      }

      await fetchTypes();
      setShowModal(false);
      setSelected(null);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa loại nông sản này không?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/types/${id}`);

        if (res.status === 200 || res.status === 204) {
          toast.success("Xóa thành công!");
          await fetchTypes();
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        toast.error("Không thể xóa (Có thể loại này đang chứa sản phẩm).");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-green-700">
          🏷️ Quản lý loại nông sản
        </h2>
        <button
          onClick={() => {
            setSelected(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          + Thêm loại
        </button>
      </div>

      {search && (
        <div className="mb-4 text-gray-600 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-search"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span>
            Kết quả tìm kiếm cho: <span className="font-bold">"{search}"</span>(
            {filteredTypes.length} mục)
          </span>
        </div>
      )}
      <DataTable
        data={filteredTypes}
        columns={[
          { key: "name", label: "Tên loại" },
          {
            key: "profitMargin",
            label: "Tỷ suất lợi nhuận",
            render: (v) => `${(v * 100).toFixed(0)}%`,
          },
          {
            key: "parentType",
            label: "Loại cha",
            render: (p) => p?.name || "-",
          },
          {
            key: "isActive",
            label: "Trạng thái",
            render: (v) => (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
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
        onEdit={(item) => {
          setSelected(item);
          setShowModal(true);
        }}
        onDelete={(item) => handleDelete(item._id)}
      />

      {search && filteredTypes.length === 0 && (
        <div className="text-center py-10 text-gray-500 bg-white rounded shadow mt-2">
          Không tìm thấy loại sản phẩm nào phù hợp với từ khóa "{search}".
        </div>
      )}

      {showModal && (
        <ModalForm
          title={selected ? "Sửa loại nông sản" : "Thêm loại nông sản"}
          onClose={() => {
            setShowModal(false);
            setSelected(null);
          }}
          onSave={(form) => handleSave(form)}
          defaultValues={
            selected
              ? {
                  ...selected,
                  parentType:
                    selected.parentType?._id || selected.parentType || "",
                }
              : {}
          }
          fields={[
            { key: "name", label: "Tên loại", type: "text", required: true },
            {
              key: "profitMargin",
              label: "Tỷ suất lợi nhuận (VD: 0.1 là 10%)",
              type: "number",
              required: true,
              step: "0.01",
            },
            {
              key: "parentType",
              label: "Loại cha",
              type: "select",
              options: [
                { label: "Không có (Đây là loại gốc)", value: "" },
                ...types
                  .filter((t) => !selected || t._id !== selected._id)
                  .map((t) => ({ label: t.name, value: t._id })),
              ],
            },
            {
              key: "isActive",
              label: "Trạng thái (Hoạt động)",
              type: "checkbox",
            },
          ]}
        />
      )}
    </div>
  );
}
