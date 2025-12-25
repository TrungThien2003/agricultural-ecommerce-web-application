import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import HeaderBar from "../../components/HeaderBar";

import ProductManager from "./ProductManager";
import TypeManager from "./TypeManager";
import ProviderManager from "./ProviderManager";
import OrderManager from "./OrderManager";
import UserManager from "./UserManager";
import WarehouseManager from "./WarehouseManager";
import { useSelector } from "react-redux";
import StatisticsManager from "./StatisticsManager";
import CommentManager from "./CommentManager";
import Chat from "./Chat";

export default function AdminDashboard() {
  const user = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = React.useState("");

  useEffect(() => {
    console.log("user", user);
  }, [user?.id]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <HeaderBar title="Bảng điều khiển quản trị" onSearch={setSearchQuery} />
        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="products" replace />} />
            <Route
              path="products"
              element={<ProductManager search={searchQuery} />}
            />
            <Route
              path="types"
              element={<TypeManager search={searchQuery} />}
            />
            <Route
              path="providers"
              element={<ProviderManager search={searchQuery} />}
            />
            <Route
              path="orders"
              element={<OrderManager search={searchQuery} />}
            />
            <Route
              path="users"
              element={<UserManager search={searchQuery} />}
            />
            <Route
              path="warehouse"
              element={<WarehouseManager search={searchQuery} />}
            />
            <Route
              path="comments"
              element={<CommentManager search={searchQuery} />}
            />
            <Route path="statistics" element={<StatisticsManager />} />
            <Route path="chat" element={<Chat />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
