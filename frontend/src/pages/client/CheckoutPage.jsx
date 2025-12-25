import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, CreditCard, Truck, AlertTriangle } from "lucide-react";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { removeSelectedItems } from "../../redux/slices/cartSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CITIES_API_URL = "/api/provinces/api/v1";

function PaymentOption({
  id,
  logoSrc,
  title,
  description,
  selectedMethod,
  onSelect,
}) {
  const isSelected = selectedMethod === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-all w-full
        ${
          isSelected
            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-300 bg-white hover:border-gray-500"
        }`}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={title}
          className="w-12 h-12 rounded-md object-contain"
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
          {id === "cod" ? (
            <Truck className="text-gray-600" />
          ) : (
            <CreditCard className="text-gray-600" />
          )}
        </div>
      )}
      <div className="text-left">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.user);

  const {
    items: itemsToCheckout = [],
    total = 0,
    subtotal = 0,
    shippingFee = 0,
  } = location.state || {};

  // STATE FORM
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE ĐỊA CHỈ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("/api/provinces/api/v1/p/");
        setProvinces(response.data);
      } catch (err) {
        console.error("Lỗi lấy Tỉnh/TP:", err);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `/api/provinces/api/v1/p/${selectedProvince}?depth=2`
          );
          setDistricts(response.data.districts);
          setWards([]);
          setSelectedDistrict("");
          setSelectedWard("");
        } catch (err) {
          console.error("Lỗi lấy Quận/Huyện:", err);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(
            `${CITIES_API_URL}/d/${selectedDistrict}?depth=2`
          );
          setWards(response.data.wards);
          setSelectedWard("");
        } catch (err) {
          console.error("Lỗi lấy Phường/Xã:", err);
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location }, replace: true });
    } else if (!itemsToCheckout || itemsToCheckout.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [itemsToCheckout, navigate, location, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !phone) {
      setError("Vui lòng điền đầy đủ Tên và Số điện thoại.");
      return;
    }
    if (
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard ||
      !houseNumber
    ) {
      setError("Vui lòng điền đầy đủ địa chỉ chi tiết.");
      return;
    }
    if (!paymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    const provinceName =
      provinces.find((p) => p.code == selectedProvince)?.name || "";
    const districtName =
      districts.find((d) => d.code == selectedDistrict)?.name || "";
    const wardName = wards.find((w) => w.code == selectedWard)?.name || "";

    const fullAddress = `${houseNumber}, ${wardName}, ${districtName}, ${provinceName}`;

    const payload = {
      userId: user.id || user._id,
      customer: {
        name,
        phone,
        address: fullAddress,
        note,
      },
      items: itemsToCheckout,
      totals: { subtotal, shippingFee, total },
      paymentMethod,
    };

    setIsSubmitting(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/orders",
        payload
      );

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success("Đặt hàng COD thành công! Cảm ơn bạn.");
        dispatch(removeSelectedItems());

        setTimeout(() => {
          navigate("/my-orders");
        }, 1500);
      }
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      const apiError =
        err.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />
      <Header hideSearch={true} />

      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="text-lg hover:text-green-600">
            Trang chủ
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <Link to="/cart" className="text-lg hover:text-green-600">
            Giỏ hàng
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-lg font-bold text-gray-800">Thanh toán</span>
        </nav>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Thông tin giao hàng
              </h2>

              <div className="space-y-4">
                {/* NAME + PHONE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                      placeholder="090xxxxxxx"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh / Thành
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      <option value="">-- Chọn Tỉnh --</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận / Huyện
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvince}
                      className="w-full border border-gray-300 rounded-lg p-3 disabled:bg-gray-100"
                    >
                      <option value="">-- Chọn Quận --</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phường / Xã
                    </label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict}
                      className="w-full border border-gray-300 rounded-lg p-3 disabled:bg-gray-100"
                    >
                      <option value="">-- Chọn Phường --</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú (Tùy chọn)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Lưu ý giao hàng..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Phương thức thanh toán
              </h2>

              <div className="space-y-4">
                <PaymentOption
                  id="cod"
                  title="Thanh toán khi nhận hàng (COD)"
                  description="Bạn chỉ phải thanh toán khi nhận được hàng."
                  selectedMethod={paymentMethod}
                  onSelect={setPaymentMethod}
                />

                <PaymentOption
                  id="vnpay"
                  title="Thanh toán qua VNPAY"
                  description="Quét mã QR, Thẻ nội địa, Tài khoản ngân hàng."
                  logoSrc="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                  selectedMethod={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-4 border-b">
                Đơn hàng ({itemsToCheckout.length} món)
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {itemsToCheckout.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md border"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.productName}
                      </h3>

                      {item.variantName && (
                        <p className="text-xs text-gray-500 truncate">
                          Phân loại: {item.variantName}
                        </p>
                      )}

                      <p className="text-xs text-gray-400">
                        {item.weight} kg / {item.unit}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.quantity} x {item.price.toLocaleString("vi-VN")} ₫
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-gray-700">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính:</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">
                    {shippingFee === 0
                      ? "Miễn phí"
                      : `${shippingFee.toLocaleString("vi-VN")} ₫`}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-dashed">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">
                    {total.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border text-red-600 rounded-lg flex items-start gap-2 text-sm">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-6 w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg
                  ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#c9d935] hover:bg-[#aab82b] active:scale-95"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : paymentMethod === "cod" ? (
                  "Đặt hàng ngay"
                ) : (
                  "Thanh toán qua VNPAY"
                )}
              </button>

              <p className="text-xs text-center text-gray-400 mt-4">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng
                tôi.
              </p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
