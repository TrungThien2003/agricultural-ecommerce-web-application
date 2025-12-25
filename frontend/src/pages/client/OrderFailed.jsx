import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const OrderFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  const getErrorMessage = (responseCode) => {
    switch (responseCode) {
      case "24":
        return "Bạn đã hủy giao dịch.";
      case "11":
        return "Giao dịch thất bại: Hết hạn chờ thanh toán.";
      case "12":
        return "Thẻ/Tài khoản của bạn bị khóa.";
      case "51":
        return "Tài khoản của bạn không đủ số dư.";
      case "65":
        return "Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày.";
      case "75":
        return "Ngân hàng thanh toán đang bảo trì.";
      case "97":
        return "Chữ ký bảo mật không hợp lệ (Lỗi Checksum).";
      case "99":
        return "Lỗi không xác định hoặc lỗi hệ thống.";
      default:
        return "Giao dịch thất bại. Vui lòng thử lại.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {/* Icon Failed */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Thanh toán thất bại
        </h2>
        <p className="text-red-500 font-medium mb-6">{getErrorMessage(code)}</p>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-gray-500">Mã lỗi:</p>
          <p className="font-mono font-bold text-gray-800">
            {code || "Unknown"}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/checkout")} // Hoặc trang thanh toán lại
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Thử thanh toán lại
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Quay về giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFailed;
