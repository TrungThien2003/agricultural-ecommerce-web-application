import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBox,
  FaTags,
  FaTruck,
  FaUsers,
  FaShoppingCart,
  FaWarehouse,
} from "react-icons/fa";
import { LayoutDashboard, MessagesSquareIcon } from "lucide-react";

const menuItems = [
  { name: "Sản phẩm", icon: <FaBox />, path: "/admin/products" },
  { name: "Loại sản phẩm", icon: <FaTags />, path: "/admin/types" },
  { name: "Nhà cung cấp", icon: <FaTruck />, path: "/admin/providers" },
  { name: "Đơn hàng", icon: <FaShoppingCart />, path: "/admin/orders" },
  { name: "Người dùng", icon: <FaUsers />, path: "/admin/users" },
  { name: "Quản lý kho", icon: <FaWarehouse />, path: "/admin/warehouse" },
  {
    path: "/admin/statistics",
    name: "Thống kê",
    icon: <LayoutDashboard size={20} />,
  },
  {
    path: "/admin/comments",
    name: "Quản lý bình luận",
    icon: <FaUsers size={20} />,
  },
  {
    path: "/admin/chat",
    name: "Nhắn tin",
    icon: <MessagesSquareIcon size={20} />,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r shadow-sm min-h-screen p-4">
      <div className="flex items-center justify-between">
        <a href="/admin" className="flex items-center">
          <img
            className="h-10 w-auto"
            src="https://cdn.prod.website-files.com/5f186b75b647cf7c841cecae/5f1899c321f9e6021e4a3fc4_logo-02-farm-template.svg"
            alt="Farm Logo"
          />
        </a>
        <h2 className="text-2xl font-bold text-green-600 mb-6">Farm Store</h2>
      </div>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-100 transition ${
                location.pathname.includes(item.path)
                  ? "bg-green-200 text-green-800 font-semibold"
                  : ""
              }`}
            >
              {item.icon} {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
