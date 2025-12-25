import React, { useState, useEffect, useRef } from "react";
import {
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt, // Icon Đăng xuất
  FaBoxOpen, // Icon Đơn hàng
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Link } from "react-router-dom"; // (1) Dùng <Link>
import { motion, AnimatePresence } from "framer-motion"; // (2) Thêm animation
// (3) Giả sử bạn có action 'logout' trong userSlice
import { resetUser } from "../redux/slices/userSlice"; // <-- Sửa đường dẫn nếu cần
import { resetCart } from "../redux/slices/cartSlice";

// NavLink (Sửa lại để dùng <Link> của React Router)
const NavLink = ({ href, children, className = "", isActive = false }) => (
  <li>
    <Link
      to={href} // (4) Dùng <Link to=""> thay vì <a href="">
      className={`font-medium text-gray-700 hover:text-black transition-all duration-200 rounded-md ${className} ${
        isActive ? "bg-green-100 text-green-800 font-bold px-3 py-1" : ""
      }`}
    >
      {children}
    </Link>
  </li>
);

const Header = ({ hideSearch = false, keyword, onSearchChange }) => {
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // (5) Thêm state cho user dropdown

  // (6) Tạo Ref cho các khu vực
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // (7. Hợp nhất logic "Bấm ra ngoài")
  useEffect(() => {
    function handleClickOutside(event) {
      // Bấm ra ngoài Search
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      // Bấm ra ngoài User Menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(resetUser());
    dispatch(resetCart());
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="absolute bottom-0 left-0 right-0 h-0.5 border-b-2 border-[#a6f1d7]"></div>

      <div className="container-default mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center py-5 max-w-full mx-auto">
          {/* === PHẦN BÊN TRÁI (LOGO & NAV) === */}
          <div className="flex-shrink-0 flex items-center gap-9">
            <Link to="/" className="flex items-center">
              <img
                className="h-10 w-auto"
                src="https://cdn.prod.website-files.com/5f186b75b647cf7c841cecae/5f1899c321f9e6021e4a3fc4_logo-02-farm-template.svg"
                alt="Farm Logo"
              />
            </Link>
            <nav className="hidden md:flex md:items-center md:gap-8">
              <ul className="flex items-center gap-8 text-[#122423] font-[Red_Hat_Display] text-[18px] tracking-[-0.18px] leading-[18px]">
                <NavLink href="/" isActive={pathname === "/"}>
                  Trang Chủ
                </NavLink>
                {/* (Thêm các NavLink khác) */}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!hideSearch && (
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-gray-700 hover:text-black"
                >
                  <FaSearch size={20} />
                </button>

                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-72"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm kiếm sản phẩm..."
                          className="w-full border border-gray-300 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                          autoFocus
                          value={keyword}
                          onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-black bg-[#e4f9e7] flex flex-col rounded-full justify-center place-items-center min-w-[49px] h-[49px]"
            >
              <FaShoppingCart size={22} />
              <span
                className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center 
                         bg-[#054040] text-white text-[10px] font-bold rounded-full h-5 w-5"
              >
                {cart.totalQuantity || 0}
              </span>
            </Link>

            {user?.access_token ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1 text-gray-700 hover:text-black"
                >
                  <FaUserCircle size={28} className="text-green-700" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border z-50"
                    >
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-800 truncate">
                          {user.fullname || "Người dùng"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <ul className="py-2">
                        <li>
                          <Link
                            to="/my-orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaBoxOpen size={16} />
                            Đơn hàng của tôi
                          </Link>
                        </li>
                        <li className="border-t mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <FaSignOutAlt size={16} />
                            Đăng xuất
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                href="/sign-in"
                className="hidden md:flex items-center gap-2 bg-[#c9d935] text-[#122423] py-3 px-6 rounded-full hover:bg-opacity-90 transition-all justify-center font-bold tracking-[-0.18px] leading-[16px] text-center"
              >
                Đăng Nhập
              </a>
            )}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={24} />
                ) : (
                  <FaBars size={24} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-10 overflow-hidden"
          >
            <nav className="flex flex-col gap-4 p-5">
              <NavLink href="/" isActive={pathname === "/"}>
                Trang chủ
              </NavLink>
              <NavLink href="/about" isActive={pathname === "/about"}>
                Về chúng tôi
              </NavLink>
              <div className="border-t pt-4">
                {!user?.access_token && (
                  <a
                    href="/sign-in"
                    className="flex items-center justify-center gap-2 bg-[#c9d935] text-[#122423] py-3 px-6 rounded-full font-bold"
                  >
                    Đăng Nhập
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
