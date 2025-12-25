// src/components/product/VariantSelectionModal.jsx
import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
import { addItemToCart } from "../../redux/slices/cartSlice"; // <-- Sửa đường dẫn tới cartSlice của bạn

export default function VariantSelectionModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch();

  // Logic gộp biến thể (giống hệt ProductDetailPage)
  const allOptions = useMemo(() => {
    const baseOption = {
      _id: "base_product",
      name: product.unit,
      sellingPrice: product.sellingPrice,
      totalQuantity: product.quantity,
    };
    const otherVariants = (product.variants || []).map((variant) => {
      const priceData = (product.variantsWithPrice || []).find(
        (p) => p._id === variant._id
      );
      const quantityData = (product.variantsWithQuantity || []).find(
        (q) => q._id === variant._id
      );
      return {
        ...variant,
        sellingPrice: priceData?.sellingPrice || 0,
        totalQuantity: quantityData?.quantity || 0,
      };
    });
    return [baseOption, ...otherVariants];
  }, [product]);

  // State nội bộ của Modal
  const [selectedVariantId, setSelectedVariantId] = useState(allOptions[0]._id);
  const [quantity, setQuantity] = useState(1);

  // Lấy thông tin của biến thể đang được chọn
  const currentOption = useMemo(() => {
    return (
      allOptions.find((opt) => opt._id === selectedVariantId) || allOptions[0]
    );
  }, [selectedVariantId, allOptions]);

  // Reset state khi đổi sản phẩm
  React.useEffect(() => {
    setSelectedVariantId(allOptions[0]._id);
    setQuantity(1);
  }, [product, allOptions]);

  const handleVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  // Hàm cuối cùng để thêm vào giỏ hàng
  const handleConfirmAddToCart = () => {
    // const selectedVariant =
    //   currentOption._id === "base_product" ? null : currentOption;

    // Gửi payload theo cấu trúc cartSlice đã thiết kế
    dispatch(
      addItemToCart({
        product: product, // Gửi cả object product cha
        selectedVariantId: currentOption._id, // Gửi object variant đã chọn (hoặc null)
        quantity: quantity,
      })
    );

    onClose(); // Đóng modal
    // (Bạn có thể thêm thông báo "Đã thêm thành công" ở đây)
  };

  if (!isOpen) return null;

  const isOutOfStock = currentOption.totalQuantity === 0;

  return (
    // Lớp nền mờ
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
    >
      {/* Nội dung Modal */}
      <div
        onClick={(e) => e.stopPropagation()} // Ngăn click xuyên thấu
        className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Chọn tùy chọn</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Thông tin sản phẩm */}
          <div className="flex gap-4">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-20 h-20 rounded-lg border object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{product.name}</h4>
              {/* Giá và tồn kho động */}
              <p className="text-lg font-bold text-blue-600">
                {currentOption.sellingPrice.toLocaleString("vi-VN")}₫
              </p>
              <p className="text-sm text-gray-500">
                Tồn kho: {currentOption.totalQuantity}
              </p>
            </div>
          </div>

          {/* Chọn biến thể */}
          <div>
            <span className="text-base font-semibold text-gray-800">
              Chọn loại:
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {allOptions.map((option) => (
                <button
                  key={option._id}
                  onClick={() => handleVariantChange(option._id)}
                  disabled={option.totalQuantity === 0}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors
                    ${
                      selectedVariantId === option._id
                        ? "border-green-600 bg-green-50 text-green-700 ring-2 ring-green-200"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                    }
                    ${
                      option.totalQuantity === 0
                        ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                        : ""
                    }
                  `}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn số lượng */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">Số lượng:</span>
            <div className="inline-flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg disabled:opacity-50"
                disabled={isOutOfStock || quantity === 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-5 py-2 font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(
                    Math.min(currentOption.totalQuantity, quantity + 1)
                  )
                }
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-50"
                disabled={
                  isOutOfStock || quantity === currentOption.totalQuantity
                }
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer (Nút xác nhận) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={handleConfirmAddToCart}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 text-white font-bold bg-[#c9d935] py-3 px-6 rounded-lg shadow-md hover:bg-[#339b76] transition-all
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            {isOutOfStock ? "Đã hết hàng" : `Thêm vào giỏ`}
          </button>
        </div>
      </div>
    </div>
  );
}
