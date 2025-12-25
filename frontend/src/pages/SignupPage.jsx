import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignupPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname || !email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/users/sign-up", {
        fullname,
        email,
        password,
        confirmPassword: password, // ✅ confirmPassword = password
      });

      toast.success("Đăng ký thành công");
      navigate("/sign-in");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại"
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
          <h2 className="text-3xl font-bold text-green-700">
            Đăng ký tài khoản
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border border-green-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

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
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-sm text-center text-green-700 mt-5">
          Đã có tài khoản?{" "}
          <a href="/sign-in" className="font-semibold underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
