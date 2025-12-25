import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/client/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProductDetailPage from "./pages/client/ProductDetailPage";
import CartPage from "./pages/client/CartPage";
import CheckoutPage from "./pages/client/CheckoutPage";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import OrdersPage from "./pages/client/OrdersPage";
import { updateUser } from "./redux/slices/userSlice";
import OrderSuccess from "./pages/client/OrderSuccess";
import OrderFailed from "./pages/client/OrderFailed";

function App() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // State mới: Theo dõi trạng thái Interceptor đã được thiết lập xong chưa
  const [isInterceptorSetup, setIsInterceptorSetup] = useState(false);

  // ------------------------------------------------------------------
  // 1. LOGIC THIẾT LẬP AXIOS INTERCEPTOR
  // ------------------------------------------------------------------
  useEffect(() => {
    // Nếu không có token, Interceptor không cần làm gì, coi như đã setup xong ngay
    if (!user || !user.access_token) {
      setIsInterceptorSetup(true);
      console.log("Interceptor: No token found, setup complete.");
      return;
    }

    setIsInterceptorSetup(false);
    console.log("Interceptor: Starting setup for user:", user.name);

    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (user && user.access_token) {
          config.headers.Authorization = `Bearer ${user.access_token}`;
          console.log("✅ Interceptor: Token attached.");
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    setIsInterceptorSetup(true);
    console.log("Interceptor: Setup complete.");

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      console.log("Interceptor: Ejected old interceptor.");
    };
  }, [user]);

  useEffect(() => {
    if (user && user.isLoading) {
      console.log(
        "App Init: Authentication state resolved. Setting isLoading to false."
      );
      dispatch(updateUser({ ...user, isLoading: false }));
    }
  }, [user, dispatch]);

  const isUserLoading = user && user.isLoading;
  const isWaitingForInterceptor = user?.access_token && !isInterceptorSetup;

  if (isUserLoading || isWaitingForInterceptor) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-gray-700">
        Đang khởi tạo hệ thống và xác thực người dùng... 🔄
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminDashboard />}></Route>
      <Route path="/" element={<Home />}></Route>
      <Route path="/sign-in" element={<LoginPage />}></Route>
      <Route path="/sign-up" element={<SignupPage />}></Route>
      <Route path="/details/:id" element={<ProductDetailPage />}></Route>
      <Route path="/cart" element={<CartPage />}></Route>
      <Route path="/checkout" element={<CheckoutPage />}></Route>
      <Route path="/my-orders" element={<OrdersPage />}></Route>
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/order-failed" element={<OrderFailed />} />
    </Routes>
  );
}

export default App;
