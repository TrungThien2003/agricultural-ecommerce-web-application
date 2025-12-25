// File: FilterDropdown.js
import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

/**
 * Component Dropdown Tối Giản
 * - CẬP NHẬT: Tự động mở khi HOVER (rê chuột).
 * - CẬP NHẬT: Thêm thanh cuộn (scrollbar) thẩm mỹ, nhỏ gọn.
 */
const FilterDropdown = ({ title, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Ref giờ đây không cần cho logic bấm ra ngoài, nhưng vẫn hữu ích
  const dropdownRef = useRef(null);

  // (Logic bấm ra ngoài không còn cần thiết nếu dùng hover)
  // useEffect(() => { ... });

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false); // Tự động đóng khi chọn
  };

  const handleReset = () => {
    setSelected(null);
    setIsOpen(false); // Tự động đóng khi chọn
  };

  const buttonText = selected || title;
  const allText =
    title === "Tiêu Chuẩn" ? "Tất cả Tiêu Chuẩn" : "Tất cả Canh Tác";

  return (
    <>
      {/* === 2. THÊM CSS CHO THANH CUỘN THẨM MỸ === */}
      {/* Thêm khối <style> này để tùy chỉnh thanh cuộn.
        Nó chỉ ảnh hưởng đến phần tử nào có class 'custom-scrollbar'.
      */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px; /* Độ rộng thanh cuộn */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; /* Nền trong suốt */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db; /* Màu của thanh cuộn (xám nhạt) */
          border-radius: 6px; /* Bo tròn */
          border: 2px solid transparent; /* Tạo khoảng cách 2 bên */
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af; /* Màu khi rê chuột */
        }
      `}</style>
      {/* === KẾT THÚC CSS === */}

      {/* === 1. THAY ĐỔI LOGIC TỪ CLICK SANG HOVER === */}
      <div
        className="relative"
        ref={dropdownRef}
        onMouseEnter={() => setIsOpen(true)} // Mở khi rê chuột vào
        onMouseLeave={() => setIsOpen(false)} // Đóng khi rê chuột ra
      >
        {/* Nút kích hoạt Dropdown (đã xóa onClick) */}
        <button
          className="flex items-center justify-between gap-2 px-5 py-3 rounded-full 
                     bg-[#e0f4e0] text-[#122423] font-medium text-sm 
                     hover:bg-[#c8eac8] transition w-60 text-left"
        >
          <span className="truncate">{buttonText}</span>
          <FaChevronDown size={12} className="flex-shrink-0" />
        </button>

        {/* Nội dung Dropdown (hiển thị khi isOpen) */}
        {isOpen && (
          <div
            className="absolute top-full mt-2 w-60 bg-white rounded-lg shadow-xl 
                       border border-gray-200 z-30 overflow-hidden"
          >
            {/* === Thêm class 'custom-scrollbar' vào đây === */}
            <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
              {/* Lựa chọn "Tất cả" */}
              <button
                onClick={handleReset}
                className={`block w-full text-left p-3 rounded-md text-gray-700 
                            hover:bg-[#f0f8f0] transition-colors
                            ${!selected ? "font-bold bg-[#f0f8f0]" : ""}`}
              >
                {allText}
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              {/* Các options khác */}
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`block w-full text-left p-3 rounded-md text-gray-700 
                              hover:bg-[#f0f8f0] transition-colors
                              ${
                                selected === option
                                  ? "font-bold bg-[#f0f8f0]"
                                  : ""
                              }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterDropdown;
