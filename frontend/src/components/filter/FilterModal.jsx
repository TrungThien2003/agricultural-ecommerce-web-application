// File: FilterModal.js
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

// Component Checkbox con
const CheckboxOption = ({ label }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <label className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
        className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

// Component Modal chính
const FilterModal = ({ isOpen, onClose, title, options }) => {
  if (!isOpen) return null;

  return (
    // Lớp phủ mờ (Backdrop)
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      onClick={onClose} // Bấm ra ngoài để đóng
    >
      {/* Khung nội dung Modal */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 z-50"
        onClick={(e) => e.stopPropagation()} // Ngăn bấm vào modal bị đóng
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#122423]">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Thân Modal (Danh sách options) */}
        <div className="p-5 space-y-2 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <CheckboxOption key={option} label={option} />
          ))}
        </div>

        {/* Footer Modal */}
        <div className="flex justify-end p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-[#c9d935] text-[#122423] font-bold py-2 px-5 rounded-full hover:bg-opacity-90"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
