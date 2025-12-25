import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUser } from "../redux/slices/userSlice";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/users/sign-in", {
        email,
        password,
      });

      if (res.status === 200 && res.data.status === "Success") {
        const { access_token, id, fullname, email, isAdmin } = res.data.data;

        const decoded = jwtDecode(access_token);

        dispatch(
          updateUser({
            id,
            name: fullname,
            email,
            isAdmin: isAdmin || false,
            access_token,
          })
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            id,
            name: fullname,
            email,
            isAdmin,
            access_token,
          })
        );

        toast.success("Đăng nhập thành công");
        window.location.href = isAdmin ? "/admin" : "/";
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Email hoặc mật khẩu không đúng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-50">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-green-100">
        <div className="flex flex-col items-center gap-1 mb-6">
          <a href="/home">
            <img
              className="h-10"
              src="https://cdn.prod.website-files.com/5f186b75b647cf7c841cecae/5f1899c321f9e6021e4a3fc4_logo-02-farm-template.svg"
              alt="Farm Logo"
            />
          </a>
          <h2 className="text-3xl font-bold text-green-700">Đăng nhập</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-green-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-green-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-2 rounded-lg transition
              ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-sm text-center text-green-700 mt-5">
          Chưa có tài khoản?{" "}
          <a href="/sign-up" className="font-semibold underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
