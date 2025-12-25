import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  Package,
  Eye,
  XCircle,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import OrderDetailsModal from "../../components/order/OrderDetailsModal"; // Component Modal chi tiết

const formatPrice = (price) => {
  if (typeof price !== "number") return "N/A";
  return price.toLocaleString("vi-VN") + "₫";
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      text: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    confirmed: {
      text: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    shipping: {
      text: "Đang giao",
      color: "bg-purple-100 text-purple-800 border-purple-300",
    },
    delivered: {
      text: "Đã giao",
      color: "bg-green-100 text-green-800 border-green-300",
    },
    cancelled: {
      text: "Đã hủy",
      color: "bg-red-100 text-red-800 border-red-300",
    },
  };
  const config = statusConfig[status] || {
    text: status,
    color: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.color}`}
    >
      {config.text}
    </span>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/orders/my-orders"
      );
      setOrders(data);
    } catch (err) {
      console.error("Lỗi tải lịch sử đơn hàng:", err);
      if (err.response && err.response.status === 401) {
        setError("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError("Không thể tải lịch sử đơn hàng.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !user.access_token) {
      if (!loading) navigate("/login");
      return;
    }

    let timeoutId;
    timeoutId = setTimeout(() => {
      fetchOrders();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, navigate, fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    setCancelLoading(orderId);
    try {
      const { data: updatedOrder } = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`
      );

      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === orderId ? updatedOrder : o))
      );
      toast.success("Đã hủy đơn hàng thành công!");
    } catch (err) {
      const apiError = err.response?.data?.error || "Hủy đơn thất bại.";
      toast.error(apiError);
    } finally {
      setCancelLoading(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Đang tải đơn hàng...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center py-12 bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      );
    }
    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
          <ShoppingCart className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có đơn hàng nào
          </h3>
          <p className="text-gray-500 mb-4">
            Hãy bắt đầu mua sắm những sản phẩm nông nghiệp chất lượng!
          </p>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            Tiếp tục mua sắm <ChevronRight size={16} />
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {orders?.map((order) => {
          const hoursDifference =
            (new Date() - new Date(order.orderDate)) / (1000 * 60 * 60);
          const canCancel =
            (order.orderStatus === "pending" ||
              order.orderStatus === "confirmed") &&
            hoursDifference <= 24;

          const firstItem =
            order?.orderItems && order.orderItems.length > 0
              ? order.orderItems[0].batch?.product?.name || "Sản phẩm"
              : "Sản phẩm";

          const itemSummary =
            order?.orderItems?.length > 1
              ? `${firstItem} và ${order.orderItems.length - 1} sản phẩm khác`
              : firstItem;

          const paymentStatus = order.isPaid ? (
            <span className="text-green-600 font-semibold">Đã TT</span>
          ) : (
            <span className="text-red-600 font-semibold">Chưa TT</span>
          );

          return (
            <div
              key={order._id}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Package size={20} className="text-indigo-500" />
                  Đơn hàng #{order._id.slice(-8).toUpperCase()}
                </h4>
                <StatusBadge status={order.orderStatus} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-800 mb-1">Ngày đặt:</p>
                  <p className="text-xs">
                    {new Date(order.orderDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    {itemSummary}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-800 mb-1">Thanh toán:</p>
                  <p className="text-xs">
                    {order.paymentType.toUpperCase()} ({paymentStatus})
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Giao tới: {order.customerAddress.split(",")[0]}...
                  </p>
                </div>

                {/* Cột 3: Tổng tiền & Hành động */}
                <div className="text-right flex flex-col justify-between">
                  <p className="font-bold text-2xl text-indigo-700">
                    {formatPrice(order.total)}
                  </p>
                  <div className="flex justify-end items-center gap-3 mt-4">
                    <button
                      onClick={() => handleViewDetails(order._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition shadow-sm"
                      title="Xem chi tiết đơn hàng"
                    >
                      <Eye size={14} />
                      Chi tiết
                    </button>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancelLoading === order._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 transition shadow-sm
                                                    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-wait"
                        title="Hủy đơn hàng"
                      >
                        {cancelLoading === order._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />
      <Header />
      <div className="container mx-auto max-w-4xl p-4 lg:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-3">
          Lịch sử Đơn hàng
        </h2>
        {renderContent()}
      </div>
      <Footer />
      <OrderDetailsModal
        orderId={selectedOrderId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
