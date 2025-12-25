import React, { useState, useEffect, useMemo } from "react";
import DataTable from "../../components/DataTable";
import ModalForm from "../../components/ModalForm";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function ProviderManager({ search }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [providers, setProviders] = useState([]);

  const fetchProviders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/providers");
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi fetch providers:", error);
      toast.error("Không thể tải danh sách nhà cung cấp");
      setProviders([]);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    if (!search) return providers;

    const lowerSearch = search.toLowerCase().trim();

    return providers.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(lowerSearch);
      const matchAddress = item.address?.toLowerCase().includes(lowerSearch);
      const matchEmail = item.email?.toLowerCase().includes(lowerSearch);
      const matchPhone = item.phone?.includes(lowerSearch);

      return matchName || matchAddress || matchEmail || matchPhone;
    });
  }, [providers, search]);

  const handleSave = async (data) => {
    try {
      if (selected) {
        const res = await axios.put(
          `http://localhost:5000/api/providers/${selected._id}`,
          data
        );
        if (res.status === 200) {
          toast.success("Cập nhật nhà cung cấp thành công!");
        }
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/providers",
          data
        );
        if (res.status === 201 || res.status === 200) {
          toast.success("Thêm nhà cung cấp thành công!");
        }
      }

      await fetchProviders();
      setShowModal(false);
      setSelected(null);
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu nhà cung cấp!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này không?")) {
      try {
        const res = await axios.delete(
          `http://localhost:5000/api/providers/${id}`
        );

        if (res.status === 200) {
          toast.success("Xoá nhà cung cấp thành công!");
          await fetchProviders();
        }
      } catch (err) {
        console.error("Lỗi khi xoá:", err);
        toast.error("Không thể xoá (Có thể NCC này đang có đơn nhập hàng).");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="flex justify-between mb-6 items-center">
        <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2">
          🏭 Quản lý nhà cung cấp
        </h2>
        <button
          onClick={() => {
            setSelected(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition transform hover:scale-105"
        >
          + Thêm nhà cung cấp
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
            {filteredProviders.length} nhà cung cấp)
          </span>
        </div>
      )}

      <DataTable
        data={filteredProviders} // Truyền danh sách đã lọc
        columns={[
          { key: "name", label: "Tên nhà cung cấp" },
          { key: "address", label: "Địa chỉ" },
          { key: "phone", label: "Số điện thoại" },
          { key: "email", label: "Email" },
          {
            key: "isActive",
            label: "Trạng thái",
            render: (v) => (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  v
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {v ? "Đang hoạt động" : "Ngưng"}
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

      {search && filteredProviders.length === 0 && (
        <div className="text-center py-10 text-gray-500 bg-white rounded shadow mt-2">
          Không tìm thấy nhà cung cấp nào khớp với từ khóa "{search}".
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <ModalForm
          title={selected ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          defaultValues={selected || {}}
          fields={[
            {
              key: "name",
              label: "Tên nhà cung cấp",
              type: "text",
              required: true,
              placeholder: "Ví dụ: HTX Nông Sản Việt",
            },
            {
              key: "address",
              label: "Địa chỉ",
              type: "text",
              placeholder: "Ví dụ: 123 Nguyễn Huệ, TP.HCM",
            },
            {
              key: "phone",
              label: "Số điện thoại",
              type: "text",
              placeholder: "0912345678",
            },
            {
              key: "email",
              label: "Email",
              type: "email",
              placeholder: "example@gmail.com",
            },
            {
              key: "isActive",
              label: "Đang hoạt động",
              type: "checkbox",
            },
          ]}
        />
      )}
    </div>
  );
}
