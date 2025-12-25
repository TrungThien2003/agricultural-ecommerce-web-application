import React from "react";
import { FiStar, FiShoppingCart, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function ProductCard1({ product, onAddToCartClick }) {
  // === HELPER FUNCTIONS (Giữ nguyên) ===
  const getFormattedPrice = (price) => {
    if (typeof price !== "number" || isNaN(price)) return "Liên hệ";
    return price.toLocaleString("vi-VN") + "₫";
  };

  const getFormattedHSD = (dateString) => {
    if (!dateString) return "Không rõ HSD";
    const date = new Date(dateString);
    if (isNaN(date)) return "Ngày không hợp lệ";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const handleAddToCartClick = (e) => {
    e.preventDefault(); // Ngăn thẻ <a> (nếu có) điều hướng
    e.stopPropagation(); // Ngăn sự kiện nổi bọt
    onAddToCartClick(product); // Gọi hàm từ cha để mở Modal
  };

  const navigate = useNavigate();

  // === LẤY DỮ LIỆU TỪ PROP (Giữ nguyên) ===
  const price = getFormattedPrice(product.sellingPrice);
  const rating = product.averageRating || 0;
  const voteNumbers = product.voteNumbers || 0;
  const hsd = getFormattedHSD(product.nearestExpiryDate);
  const productStandard = product.standardOfProduct?.name || "";
  const soldCount = product.sold || 0;

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden 
                   transition-all duration-300 hover:shadow-lg
                   flex flex-col"
    >
      {/* 1. KHỐI HÌNH ẢNH (Giữ nguyên) */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          onClick={() => navigate(`/details/` + product._id)}
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/400x300?text=Sản+Phẩm"
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {productStandard && (
          <span
            className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md 
                       opacity-80 z-10"
          >
            {productStandard}
          </span>
        )}
        <span
          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-md opacity-90 z-10
            ${
              soldCount > 0
                ? "bg-orange-100 text-orange-800" // Màu cam cho "Đã bán"
                : "bg-gray-100 text-gray-700" // Màu xám cho "Chưa bán"
            }
          `}
        >
          {soldCount > 0 ? `Đã bán ${soldCount}` : "Chưa có lượt bán"}
        </span>
      </div>

      {/* 2. KHỐI NỘI DUNG (Thiết kế lại) */}
      <div className="p-4 flex flex-col flex-grow">
        {/* GIÁ (SỬA Ở ĐÂY) */}
        <p className="text-[#339b76] font-redhat text-[22px] font-light tracking-[-0.24px] leading-[23.992px] mb-[5px] text-left uppercase">
          {" "}
          {/* Nổi bật hơn */}
          {price === "Liên hệ" ? price : `${price}`}
        </p>

        {/* TÊN SẢN PHẨM (SỬA Ở ĐÂY) */}
        <h4
          className="text-[#122423] font-redhat text-[22px] font-bold tracking-[-0.18px] leading-[33.993px] text-left line-clamp-2 h-16" // To hơn và cao hơn
          title={product.name}
        >
          {product.name}
        </h4>

        {/* SỐ SAO KÈM SỐ ĐÁNH GIÁ (Giữ nguyên) */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={
                  i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }
                size={14}
              />
            ))}
          </div>
          <span className="ml-1.5">
            ({rating}) - {voteNumbers} đánh giá
          </span>
        </div>

        {/* HẠN SỬ DỤNG (Giữ nguyên) */}
        <p className="text-sm text-gray-600 mb-4">HSD: {hsd}</p>

        {/* CÁI ĐẨY (Giữ nguyên) */}
        <div className="flex-grow" />

        {/* KHỐI NÚT HÀNH ĐỘNG (Giữ nguyên) */}
        <div className="flex gap-2 w-full">
          <a
            href={`/product/${product.id}`}
            title="Xem chi tiết"
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 
                       py-2 px-2 rounded-lg text-sm font-medium transition-colors 
                       hover:bg-gray-100 hover:border-gray-400"
          >
            <FiEye size={16} />
            <span>Chi tiết</span>
          </a>
          <button
            onClick={handleAddToCartClick}
            title="Thêm vào giỏ"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#c9d935] text-white 
                       py-2 px-2 rounded-lg text-sm font-medium transition-colors 
                       hover:bg-[#339b76] active:bg-[#339b76]"
          >
            <FiShoppingCart size={16} />
            <span>Thêm giỏ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard1;
