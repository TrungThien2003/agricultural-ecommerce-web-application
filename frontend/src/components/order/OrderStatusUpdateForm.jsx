import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";

export default function OrderStatusUpdateForm({ order, onClose, onSuccess }) {
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const [loading, setLoading] = useState(false);

  const getNextStatuses = () => {
    switch (order.orderStatus) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["shipping", "cancelled"];
      case "shipping":
        return ["delivered"];
      case "delivered":
      case "cancelled":
      default:
        return [];
    }
  };

  const possibleNextStatuses = getNextStatuses();
  const isUpdatable = possibleNextStatuses.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newStatus === order.orderStatus) {
      toast.warn("Bạn chưa thay đổi trạng thái.");
      return;
    }

    setLoading(true);
    try {
      console.log("Cập nhật trạng thái đơn hàng:", order._id, newStatus);
      const { data: updatedOrder } = await axios.put(
        `http://localhost:5000/api/orders/${order._id}/status`,
        { status: newStatus }
      );

      onSuccess(updatedOrder);
      toast.success("Cập nhật trạng thái thành công!");
      onClose();
    } catch (err) {
      const apiError = err.response?.data?.error || "Cập nhật thất bại.";
      toast.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="p-3 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-600">
          Mã ĐH:{" "}
          <span className="font-semibold text-gray-900">
            #{order._id.slice(-6).toUpperCase()}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Khách hàng:{" "}
          <span className="font-semibold text-gray-900">
            {order.customerName}
          </span>
        </p>
      </div>

      <div>
        <label
          htmlFor="orderStatus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Thay đổi trạng thái
        </label>

        {isUpdatable ? (
          <select
            id="orderStatus"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
          >
            <option value={order.orderStatus}>
              -- Hiện tại: {order.orderStatus} --
            </option>
            {possibleNextStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-medium text-gray-700 p-3 bg-gray-100 rounded-md">
            Đơn hàng đã {order.orderStatus} và không thể cập nhật.
          </p>
        )}
      </div>

      {isUpdatable && (
        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 mr-3"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || newStatus === order.orderStatus}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      )}
    </form>
  );
}
