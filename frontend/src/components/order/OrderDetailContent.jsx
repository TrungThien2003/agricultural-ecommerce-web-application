import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";

export default function OrderDetailContent({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`
        );
        setOrder(res.data.order || res.data);
        console.log("Order detail data:", res.data);
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
        setError("Không thể tải thông tin chi tiết đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const getProductDisplayInfo = (item) => {
    const product = item.batch?.product;
    if (!product) return { name: "Sản phẩm không xác định", detail: "" };

    let variantId = item.batch.variant;

    if (variantId && typeof variantId === "object") {
      variantId = variantId._id;
    }

    if (variantId && product.variants?.length > 0) {
      const foundVariant = product.variants.find((v) => {
        return String(v._id) === String(variantId);
      });

      if (foundVariant) {
        return {
          name: product.name,
          detail: foundVariant.name,
          isVariant: true,
        };
      }
    }

    const unitText = product.unit || "";
    const weightText = product.weight ? `${product.weight}kg` : "";

    return {
      name: product.name,
      detail: `${unitText} ${weightText}`.trim(),
      isVariant: false,
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-red-500">
        <AlertCircle size={32} className="mb-2" />
        <p>{error || "Không tìm thấy dữ liệu."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm md:text-base">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold">
              Người nhận
            </p>
            <p className="font-semibold text-gray-800">{order.customerName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold">
              Số điện thoại
            </p>
            <p className="font-semibold text-gray-800">{order.customerPhone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500 text-xs uppercase font-bold">Địa chỉ</p>
            <p className="font-semibold text-gray-800">
              {order.customerAddress}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-800 mb-3 pl-2 border-l-4 border-indigo-500">
          Chi tiết sản phẩm
        </h4>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 font-semibold uppercase text-xs">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Sản phẩm</th>
                <th className="px-4 py-3 text-center">Lô hàng</th>
                <th className="px-4 py-3 text-center">Đơn giá</th>
                <th className="px-4 py-3 text-center">SL</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.orderItems.map((item) => {
                const info = getProductDisplayInfo(item);
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 border rounded overflow-hidden bg-gray-100">
                          {item.batch?.product?.images?.[0] ? (
                            <img
                              src={item.batch.product.images[0]}
                              alt={info.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Img
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-gray-800 text-sm md:text-base">
                            {info.name}
                          </p>
                          {info.detail && (
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${
                                info.isVariant
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {info.detail}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      <div className="font-mono bg-yellow-50 text-yellow-800 px-1 rounded inline-block">
                        {item.batch?.idBatchCode}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {item.price?.toLocaleString()} đ
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="font-bold bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                        x{item.quantity}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-indigo-600">
                      {(item.price * item.quantity).toLocaleString()} đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <div className="text-right">
          <span className="text-gray-600 mr-4 text-sm">Tổng thanh toán:</span>
          <span className="text-xl md:text-2xl font-bold text-red-600">
            {order.total?.toLocaleString()} đ
          </span>
        </div>
      </div>
    </div>
  );
}
