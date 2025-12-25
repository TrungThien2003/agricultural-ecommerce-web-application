// File: FilterSortBar.js
import React from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import FilterDropdown from "../../components/filter/FilterDropdown";

// Component này giờ sẽ nhận prop `onOpenModal` từ cha
const standardsOptions = ["VietGAP", "Hữu cơ (Organic)", "GlobalGAP", "OCOP"];
const methodsOptions = [
  "Thủy canh",
  "Nhà kính",
  "Thuận tự nhiên",
  "Truyền thống",
];
const FilterSortBar = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white shadow-md  p-2 border rounded-[30px] border-gray-100">
      {/* === TÁCH THÀNH 2 NÚT LỌC === */}
      <div className="flex gap-3">
        <FilterDropdown title="Tiêu Chuẩn" options={standardsOptions} />
        <FilterDropdown title="Phương Pháp Canh Tác" options={methodsOptions} />
      </div>
      {/* === KẾT THÚC TÁCH NÚT === */}

      {/* === CẬP NHẬT: THÊM THANH TÌM KIẾM === */}
      {/* Phần bên phải: Gói Tìm kiếm và Sắp xếp vào chung 1 div */}
      <div className="flex items-center gap-3">
        {/* 2. Thanh Tìm Kiếm Mới */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm trong danh mục..."
            // Style giống hệt ô Sắp xếp
            className="appearance-none py-2.5 pl-10 pr-4 border border-gray-200 rounded-full 
                       bg-gray-50 text-sm font-normal text-gray-700 placeholder-gray-400
                       focus:outline-none focus:ring-1 focus:ring-green-300"
          />
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
        </div>

        {/* Dropdown Sắp xếp (Giữ nguyên) */}
        <div className="relative rounded-[30px]">
          <select
            className="appearance-none p-3 pr-10 border border-gray-300 rounded-[30px] 
                       bg-white text-sm font-medium text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-green-200 "
          >
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>
          <FaChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={14}
          />
        </div>
      </div>
      {/* === KẾT THÚC CẬP NHẬT === */}
    </div>
  );
};

export default FilterSortBar;
