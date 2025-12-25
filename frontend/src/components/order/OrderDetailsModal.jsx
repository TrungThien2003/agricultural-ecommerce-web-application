import React from "react";
import { XCircle, Package } from "lucide-react";
import OrderDetailContent from "./OrderDetailContent";

export default function OrderDetailsModal({ orderId, isOpen, onClose }) {
  if (!isOpen) return null;
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[95vh] overflow-hidden flex flex-col"
        onClick={handleModalClick}
      >
        <div className="sticky top-0 bg-white flex justify-between items-center p-5 border-b border-gray-200 z-10">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Package size={24} className="text-indigo-600" />
            Chi Tiết Đơn Hàng #
            {orderId ? orderId.slice(-8).toUpperCase() : "N/A"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="Đóng"
          >
            <XCircle size={24} className="text-gray-500 hover:text-red-500" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <OrderDetailContent orderId={orderId} />
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
