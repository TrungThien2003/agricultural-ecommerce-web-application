import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import DataTable from "../../components/DataTable";
import ModalForm from "../../components/ModalForm";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConfirmActionToast = ({
  closeToast,
  id,
  name,
  onConfirm,
  actionType,
}) => (
  <div className="p-2">
    <p className="font-semibold text-base mb-2 text-gray-800">
      {actionType === "delete"
        ? "Bạn có chắc muốn xóa?"
        : "Khôi phục người dùng này?"}
    </p>
    <p className="text-sm italic mb-3 text-gray-600 font-medium">
      User: <strong>{name}</strong>
    </p>
    <div className="flex justify-end gap-2 mt-2">
      <button
        className="px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
        onClick={closeToast}
      >
        Hủy
      </button>
      <button
        className={`px-3 py-1 text-sm rounded text-white ${
          actionType === "delete"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={() => {
          onConfirm(id);
          closeToast();
        }}
      >
        {actionType === "delete" ? "Xóa ngay" : "Khôi phục"}
      </button>
    </div>
  </div>
);

export default function UserManager({ search }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const currentUser = useSelector(
    (state) => state.user.currentUser || state.user
  );

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/get-all");
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Lỗi fetch users", error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lowerSearch = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.fullname?.toLowerCase().includes(lowerSearch) ||
        u.email?.toLowerCase().includes(lowerSearch) ||
        u.address?.toLowerCase().includes(lowerSearch)
    );
  }, [users, search]);

  const handleSave = async (data) => {
    try {
      data.confirmPassword = data.password;
      if (selected) {
        const res = await axios.put(
          `http://localhost:5000/api/users/${selected._id}`,
          data
        );
        if (res.status === 200) toast.success("Cập nhật thành công!");
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/users/sign-up-admin",
          data
        );
        if (res.status === 201 || res.status === 200)
          toast.success("Thêm mới thành công!");
      }
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu!");
    } finally {
      setShowModal(false);
      setSelected(null);
    }
  };

  const executeDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      await fetchUsers();
      toast.success("Đã xóa người dùng!");
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xóa.");
    }
  };

  const executeRestore = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, {
        isDeleted: false,
      });
      await fetchUsers();
      toast.success("Đã khôi phục người dùng!");
    } catch (err) {
      toast.error("Không thể khôi phục user.");
    }
  };

  const handleActionClick = (item) => {
    if (item.isDeleted) {
      executeRestore(item._id);
      return;
    }
    toast.warn(
      ({ closeToast }) => (
        <ConfirmActionToast
          closeToast={closeToast}
          id={item._id}
          name={item.fullname}
          onConfirm={executeDelete}
          actionType="delete"
        />
      ),
      { autoClose: false, closeButton: true }
    );
  };

  const columns = [
    {
      key: "fullname",
      label: "Họ tên",
      render: (text, item) => (
        <div
          className={item.isDeleted ? "opacity-50 line-through" : "font-medium"}
        >
          {text}
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "address", label: "Địa chỉ", render: (v) => v || "-" },
    {
      key: "isAdmin",
      label: "Quyền",
      render: (v) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            v ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {v ? "ADMIN" : "USER"}
        </span>
      ),
    },
    {
      key: "isDeleted",
      label: "Trạng thái",
      render: (v) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            v
              ? "bg-red-100 text-red-700 border-red-200"
              : "bg-green-100 text-green-700 border-green-200"
          }`}
        >
          {v ? "Đã xóa" : "Hoạt động"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Hành động",
      render: (_, item) => {
        const isMe =
          currentUser &&
          (currentUser._id === item._id || currentUser.id === item._id);

        return (
          <div className="flex gap-3 justify-end items-center">
            {!item.isDeleted && (
              <button
                onClick={() => {
                  setSelected(item);
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Sửa
              </button>
            )}
            {isMe ? (
              <span
                className="text-gray-400 text-xs italic font-medium px-2 py-1 bg-gray-100 rounded cursor-not-allowed"
                title="Bạn không thể xóa chính mình"
              >
                (Bạn)
              </span>
            ) : (
              <button
                onClick={() => handleActionClick(item)}
                className={`font-medium text-sm transition ${
                  item.isDeleted
                    ? "text-indigo-600 hover:text-indigo-900"
                    : "text-red-600 hover:text-red-800"
                }`}
              >
                {item.isDeleted ? "Khôi phục" : "Xóa"}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} limit={3} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2">
          👤 Quản lý người dùng
        </h2>
        <button
          onClick={() => {
            setSelected(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          + Thêm người dùng
        </button>
      </div>

      {search && (
        <div className="mb-4 text-gray-600">
          Kết quả cho: <b>"{search}"</b> ({filteredUsers.length})
        </div>
      )}

      <DataTable data={filteredUsers} columns={columns} />

      {showModal && (
        <ModalForm
          title={selected ? "Cập nhật thông tin" : "Thêm người dùng mới"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          defaultValues={selected || {}}
          fields={[
            { key: "fullname", label: "Họ tên", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            ...(!selected
              ? [
                  {
                    key: "password",
                    label: "Mật khẩu",
                    type: "password",
                    required: true,
                  },
                ]
              : []),
            { key: "address", label: "Địa chỉ", type: "text" },
            { key: "isAdmin", label: "Quyền Admin", type: "checkbox" },
          ]}
        />
      )}
    </div>
  );
}
