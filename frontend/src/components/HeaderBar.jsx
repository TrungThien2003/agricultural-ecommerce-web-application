import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux"; // 1. Import hook Redux
import { useNavigate } from "react-router-dom";
import { resetUser } from "../redux/slices/userSlice";

export default function HeaderBar({ title, onSearch }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { fullname } = useSelector((state) => state.user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch(resetUser());

    navigate("/sign-in");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-sm border-b px-8">
      <h1 className="text-xl font-bold text-green-700">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none w-64"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 focus:outline-none hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <span className="text-sm font-semibold text-gray-600 hidden md:block">
              {fullname || "Admin"}
            </span>
            <FaUserCircle className="text-3xl text-gray-600" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500">Xin chào,</p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {fullname || "Administrator"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors mt-1"
              >
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
