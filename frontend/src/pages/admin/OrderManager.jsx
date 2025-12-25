import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import DataTable from "../../components/DataTable";
import ModalForm from "../../components/ModalForm";
import OrderDetailContent from "../../components/order/OrderDetailContent";
import OrderStatusUpdateForm from "../../components/order/OrderStatusUpdateForm";
import {
  Loader2,
  AlertTriangle,
  Eye,
  Pencil,
  Printer,
  FileDown,
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { text: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { text: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
    shipping: { text: "Đang giao", color: "bg-purple-100 text-purple-800" },
    delivered: { text: "Đã giao", color: "bg-green-100 text-green-800" },
    cancelled: { text: "Đã hủy", color: "bg-red-100 text-red-800" },
  };
  const config = statusConfig[status] || {
    text: status,
    color: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
    >
      {config.text}
    </span>
  );
};

export default function OrderManager({ search }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    paymentType: "",
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const params = new URLSearchParams();
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.status) params.append("status", filters.status);
        if (filters.paymentType)
          params.append("paymentType", filters.paymentType);

        const { data } = await axios.get(
          `http://localhost:5000/api/orders?${params.toString()}`,
          config
        );

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setError("Hết phiên đăng nhập. Vui lòng login lại.");
        } else {
          setError("Không thể tải danh sách đơn hàng.");
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const displayedOrders = useMemo(() => {
    if (!search) return orders;

    const lowerTerm = search.toLowerCase().trim();
    return orders.filter((order) => {
      const orderIdShort = order._id.slice(-6).toLowerCase();
      const customerName = order.customerName?.toLowerCase() || "";
      const phone = order.customerPhone || "";

      return (
        orderIdShort.includes(lowerTerm) ||
        customerName.includes(lowerTerm) ||
        phone.includes(lowerTerm)
      );
    });
  }, [orders, search]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", status: "", paymentType: "" });
  };

  const handleBulkExport = async () => {
    const toastId = toast.loading("Đang tổng hợp dữ liệu...");

    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentType)
        params.append("paymentType", filters.paymentType);

      const response = await axios.get(
        `http://localhost:5000/api/orders/export-bulk?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const fileName = `Export_Orders_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.update(toastId, {
        render: "Xuất file thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        toast.update(toastId, {
          render: "Không có đơn hàng nào để xuất!",
          type: "warning",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Lỗi khi xuất danh sách!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
  };

  const handlePrintOrder = async (orderId) => {
    const toastId = toast.loading("Đang tạo file Excel...");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/orders/export/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const fileName = `Order_${orderId.slice(-6).toUpperCase()}.xlsx`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.update(toastId, {
        render: "Tải xuống thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Lỗi khi xuất file!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setIsStatusModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateSuccess = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
    handleCloseModals();
    toast.success("Cập nhật thành công!");
  };

  const columns = [
    {
      key: "_id",
      label: "Mã đơn",
      render: (id) => (
        <span className="font-mono text-gray-500 font-bold">
          #{id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      key: "customerName",
      label: "Khách hàng",
      render: (name, row) => (
        <div>
          <div className="font-medium text-gray-800">{name}</div>
          <div className="text-xs text-gray-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "orderDate",
      label: "Ngày đặt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      key: "total",
      label: "Tổng tiền",
      render: (v) => (
        <span className="font-bold text-gray-800">
          {v?.toLocaleString("vi-VN")}₫
        </span>
      ),
    },
    {
      key: "isPaid",
      label: "Thanh toán",
      render: (isPaid, row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isPaid
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {row.paymentType === "vnpay" ? "VNPAY" : "COD"} •{" "}
          {isPaid ? "ĐÃ TT" : "CHƯA TT"}
        </span>
      ),
    },
    {
      key: "orderStatus",
      label: "Trạng thái",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenDetailModal(row)}
            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition"
            title="Xem chi tiết"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => handleOpenStatusModal(row)}
            disabled={
              row.orderStatus === "cancelled" || row.orderStatus === "delivered"
            }
            className="text-green-600 hover:bg-green-50 p-1.5 rounded transition disabled:text-gray-300 disabled:hover:bg-transparent"
            title="Cập nhật trạng thái"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => handlePrintOrder(row._id)}
            className="text-gray-500 hover:bg-gray-100 p-1.5 rounded transition"
            title="Xuất Excel"
          >
            <Printer size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📦 Quản lý đơn hàng
        </h2>
        <div className="text-sm text-gray-500">
          {search && (
            <span>
              🔍 Kết quả cho: <b>"{search}"</b> •{" "}
            </span>
          )}
          Tổng cộng: <b className="text-gray-800">{displayedOrders.length}</b>{" "}
          đơn
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-green-500 outline-none"
              title="Từ ngày"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-green-500 outline-none"
              title="Đến ngày"
            />

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:ring-green-500 outline-none"
            >
              <option value="">-- Trạng thái --</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <select
              name="paymentType"
              value={filters.paymentType}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:ring-green-500 outline-none"
            >
              <option value="">-- Thanh toán --</option>
              <option value="cod">COD</option>
              <option value="vnpay">VNPay</option>
            </select>

            {(filters.startDate ||
              filters.endDate ||
              filters.status ||
              filters.paymentType) && (
              <button
                onClick={clearFilters}
                className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition text-xs font-medium"
                title="Xóa bộ lọc"
              >
                <X size={16} /> Xóa lọc
              </button>
            )}
          </div>

          <div className="ml-auto">
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition"
            >
              <FileDown size={18} /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-lg shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-red-600 bg-red-50 p-6 rounded-lg border border-red-100">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DataTable data={displayedOrders} columns={columns} />

          {displayedOrders.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              {search
                ? `Không tìm thấy đơn hàng nào khớp với "${search}"`
                : "Không có dữ liệu đơn hàng."}
            </div>
          )}
        </div>
      )}

      {/* --- MODALS --- */}
      <ModalForm
        isOpen={isDetailModalOpen}
        onClose={handleCloseModals}
        title={`Chi tiết đơn hàng #${selectedOrder?._id
          .slice(-6)
          .toUpperCase()}`}
        size="2xl"
      >
        {isDetailModalOpen && selectedOrder && (
          <OrderDetailContent orderId={selectedOrder._id} />
        )}
      </ModalForm>

      <ModalForm
        isOpen={isStatusModalOpen}
        onClose={handleCloseModals}
        title="Cập nhật trạng thái"
        size="md"
        hideFooter={true}
      >
        {isStatusModalOpen && selectedOrder && (
          <OrderStatusUpdateForm
            order={selectedOrder}
            onClose={handleCloseModals}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </ModalForm>
    </div>
  );
}
