import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronRight,
  Star,
  ShoppingCart,
  MapPin,
  Package,
  ShieldCheck,
  CheckCircle,
  Thermometer,
  Loader2,
  AlertTriangle,
  Check,
  CornerDownRight,
  Fence,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard1 from "../../components/product/ProductCard1";
import CustomerChat from "./CustomerChat";
import { addItemToCart } from "../../redux/slices/cartSlice";
import useRecentProducts from "../../hooks/useRecentProducts";
import { fetchRecommendations } from "../../helpers/recommendApi";

const Tab = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`pb-3 text-lg font-medium transition-all border-b-2 px-4 ${
      isActive
        ? "border-green-600 text-green-700"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const StarRatingDisplay = ({ rating, size = 16 }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={`${
          i < Math.round(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

const StarRatingInput = ({ rating, setRating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={24}
            className={`${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const SpecRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
    <div className="text-green-600 mt-0.5">{icon}</div>
    <div>
      <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900">
        {value || "Đang cập nhật"}
      </p>
    </div>
  </div>
);

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Bạn cần đăng nhập để đánh giá.");
      navigate("/sign-in");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/comments", {
        productId: id,
        rating: newRating,
        content: newComment,
      });
      toast.success("Cảm ơn bạn đã đánh giá!");
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Lỗi khi gửi đánh giá.");
    }
  };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState("base_product");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const [reviews, setReviews] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productRes = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        const productData = productRes.data;

        const productObj = productData.product || productData;
        console.log("chi tiet la ", productObj);
        setProduct(productObj);

        if (productObj.images?.length > 0) {
          setActiveImage(productObj.images[0]);
        } else {
          setActiveImage("https://via.placeholder.com/500?text=No+Image");
        }

        try {
          const reviewsRes = await axios.get(
            `http://localhost:5000/api/comments/product/${id}`
          );
          const formattedReviews = reviewsRes.data.comments.map((c) => ({
            id: c._id,
            user: c.user?.fullname || "Người dùng ẩn danh",
            rating: c.rating,
            comment: c.content,
            date: new Date(c.createdAt).toLocaleDateString("vi-VN"),
            replies: c.replies || [],
          }));
          setReviews(formattedReviews);
        } catch (e) {
          console.warn("Lỗi tải review hoặc chưa có review");
        }

        const userIdToSend = user?.id || null;
        const currentProductContext = id ? [id] : [];

        const dataFromPython = await fetchRecommendations(
          userIdToSend,
          [id] || [],
          6
        );

        if (dataFromPython.length === 0) {
          setSuggestedProducts([]);
          return;
        }

        const productIds = dataFromPython.map((item) => item.product_id);

        try {
          const responseNode = await axios.post(
            "http://localhost:5000/api/products/get-by-ids",
            {
              ids: productIds,
            }
          );

          const fullProducts = responseNode.data.data;

          console.log("2. Node.js tìm thấy:", fullProducts);

          const finalList = dataFromPython
            .map((pyItem) => {
              const detail = fullProducts.find(
                (p) => String(p._id) === String(pyItem.product_id)
              );

              if (!detail) return null;

              return {
                ...detail,
                match_score: pyItem.match_score,
              };
            })
            .filter((item) => item !== null);

          setSuggestedProducts(finalList);
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết sản phẩm từ Node:", error);
        }
      } catch (err) {
        setError("Lỗi kết nối hoặc không tìm thấy sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const allOptions = useMemo(() => {
    if (!product) return [];

    const options = [];
    const baseQty = product.quantity || 0;
    const hasVariants = product.variantsWithQuantity?.length > 0;

    if (baseQty > 0 || !hasVariants) {
      const parts = [];

      if (product.unit) parts.push(product.unit);
      if (product.weight) parts.push(`${product.weight} kg`);
      let baseName = parts.join(" ");
      if (!baseName) baseName = "Tiêu chuẩn";

      options.push({
        _id: "base_product",
        name: baseName,
        sellingPrice: product.sellingPrice || 0,
        totalQuantity: baseQty,
        weight: product.weight,
        unit: product.unit,
        isBase: true,
      });
    }

    if (product.variantsWithQuantity?.length > 0) {
      product.variantsWithQuantity.forEach((v) => {
        const vPriceInfo = product.variantsWithPrice?.find(
          (vp) => vp._id === v._id
        );
        const finalPrice = vPriceInfo?.sellingPrice || v.averageCost || 0;
        const vName = v.name || (v.weight ? `${v.weight} kg` : v.unit);
        options.push({
          _id: v._id,
          name: vName,
          sellingPrice: finalPrice,
          totalQuantity: v.quantity || 0,
          weight: v.weight,
          unit: v.unit,
          isBase: false,
        });
      });
    }

    return options;
  }, [product]);

  const currentOption =
    allOptions.find((opt) => opt._id === selectedOptionId) || allOptions[0];

  const chatProductData = useMemo(() => {
    if (!product) return null;
    return {
      id: product._id,
      name: product.name,
      price: currentOption?.sellingPrice
        ? `${currentOption.sellingPrice.toLocaleString("vi-VN")}₫`
        : "Liên hệ",
      desc: product.description || `Sản phẩm ${product.name} chất lượng cao.`,
    };
  }, [product, currentOption]);

  const handleOptionChange = (id) => {
    setSelectedOptionId(id);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    console.log("user khi them gio", user);
    if (!user.access_token) {
      toast.info("Vui lòng đăng nhập để mua hàng");
      navigate("/sign-in");
      return;
    }
    if (currentOption.totalQuantity <= 0) {
      toast.error("Sản phẩm này đã hết hàng!");
      return;
    }
    const payload = {
      product: product,
      selectedVariantId: selectedOptionId,
      quantity: quantity,
    };
    dispatch(addItemToCart(payload));
    toast.success(
      `Đã thêm ${quantity} ${currentOption.unit || "sản phẩm"} vào giỏ!`
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );

  if (error || !product)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-medium">
        {error || "Không tìm thấy sản phẩm"}
      </div>
    );

  return (
    <div className="bg-[#F9FAFB] min-h-screen font-sans text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} />
      <Header />

      <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-hidden whitespace-nowrap">
          <Link to="/" className="hover:text-green-600 transition">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="mx-2 flex-shrink-0" />
          <Link to="/products" className="hover:text-green-600 transition">
            {product.type?.name || "Sản phẩm"}
          </Link>
          <ChevronRight size={14} className="mx-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 truncate">
            {product.name}
          </span>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT: IMAGES */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
                {product.harvestSeasonDisplay && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm border border-green-100">
                    Vụ mùa: {product.harvestSeasonDisplay}
                  </div>
                )}
              </div>
              {product.images?.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === img
                          ? "border-green-600 ring-1 ring-green-200"
                          : "border-transparent hover:border-gray-300 bg-gray-50"
                      }`}
                    >
                      <img
                        src={img}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col">
              <Link
                to="#"
                className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2 hover:underline"
              >
                {product.provider?.name}
              </Link>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-500 text-base border-b border-yellow-400 leading-none">
                    {product.averageRating || 0}
                  </span>
                  <StarRatingDisplay rating={product.averageRating || 0} />
                </div>
                <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-bold text-gray-900 text-base border-b border-gray-300 leading-none">
                    {product.voteNumbers}
                  </span>
                  <span>Đánh giá</span>
                </div>
                <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-bold text-gray-900 text-base border-b border-gray-300 leading-none">
                    {product.sold}
                  </span>
                  <span>Đã bán</span>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-green-700">
                    {currentOption?.sellingPrice > 0
                      ? `${currentOption.sellingPrice.toLocaleString("vi-VN")}₫`
                      : "Liên hệ"}
                  </span>
                  {currentOption?.sellingPrice > 0 && (
                    <span className="text-gray-500 font-medium">
                      {currentOption.weight && currentOption.unit
                        ? `/ ${currentOption.weight} kg / ${currentOption.unit}`
                        : currentOption.weight
                        ? `/ ${currentOption.weight} kg`
                        : currentOption.unit
                        ? `/ ${currentOption.unit}`
                        : null}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {currentOption?.totalQuantity > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <CheckCircle size={12} /> Còn hàng (
                      {currentOption.totalQuantity})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <AlertTriangle size={12} /> Hết hàng
                    </span>
                  )}
                </div>
              </div>
              {allOptions.length > 1 && (
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Phân loại:
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {allOptions.map((opt) => (
                      <button
                        key={opt._id}
                        onClick={() => handleOptionChange(opt._id)}
                        disabled={opt.totalQuantity === 0}
                        className={`
                                relative px-6 py-3 rounded-lg border-2 text-sm font-bold transition-all
                                ${
                                  selectedOptionId === opt._id
                                    ? "border-green-600 bg-green-50 text-green-800 shadow-sm"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                                }
                                ${
                                  opt.totalQuantity === 0
                                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                                    : ""
                                }
                              `}
                      >
                        {opt.name}
                        {selectedOptionId === opt._id && (
                          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-600 text-white p-0.5 rounded-full">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <div className="flex items-center border-2 border-gray-200 rounded-lg w-fit bg-white h-[52px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 h-full hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition"
                    disabled={currentOption?.totalQuantity === 0}
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-gray-800 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          currentOption?.totalQuantity || 1,
                          quantity + 1
                        )
                      )
                    }
                    className="px-4 h-full hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition"
                    disabled={currentOption?.totalQuantity === 0}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={currentOption?.totalQuantity === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-[52px] rounded-lg shadow-green-200 shadow-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                >
                  <ShoppingCart size={22} />
                  {currentOption?.totalQuantity === 0
                    ? "Tạm hết hàng"
                    : "Thêm vào giỏ hàng"}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-green-600" size={20} /> Hàng
                  chính hãng 100%
                </div>
                <div className="flex items-center gap-2">
                  <Package className="text-green-600" size={20} /> Đóng gói cẩn
                  thận
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} /> Đổi trả
                  trong 7 ngày
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-200 px-4 md:px-8 pt-4 md:pt-6 gap-2 md:gap-6 overflow-x-auto">
            <Tab
              isActive={activeTab === "description"}
              onClick={() => setActiveTab("description")}
            >
              Mô tả sản phẩm
            </Tab>
            <Tab
              isActive={activeTab === "specs"}
              onClick={() => setActiveTab("specs")}
            >
              Chi tiết
            </Tab>
            <Tab
              isActive={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá ({reviews.length})
            </Tab>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === "description" && (
              <div className="prose prose-green max-w-none text-gray-700">
                <p className="whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SpecRow
                  icon={<MapPin />}
                  label="Nguồn gốc"
                  value={product.provinceOfOrigin}
                />
                <SpecRow
                  icon={<Thermometer />}
                  label="Bảo quản"
                  value={product.storageCondition}
                />
                <SpecRow
                  icon={<ShieldCheck />}
                  label="Tiêu chuẩn"
                  value={product.standardOfProduct?.name}
                />
                <SpecRow
                  icon={<CheckCircle />}
                  label="Phương pháp canh tác"
                  value={product.harvestMethod?.name}
                />
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI: DANH SÁCH ĐÁNH GIÁ */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="font-bold text-gray-800 text-lg">
                    Khách hàng nhận xét ({reviews.length})
                  </h3>

                  {reviews.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500">Chưa có đánh giá nào.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((r, i) => (
                        <div
                          key={r.id || i}
                          className="border-b border-gray-100 pb-6 last:border-0"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                              {r.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">
                                    {r.user}
                                  </p>
                                  <StarRatingDisplay
                                    rating={r.rating}
                                    size={12}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                  {r.date}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                                {r.comment}
                              </p>

                              {r.replies && r.replies.length > 0 && (
                                <div className="mt-3 pl-4 space-y-2 border-l-2 border-gray-200">
                                  {r.replies.map((reply, index) => (
                                    <div
                                      key={index}
                                      className="bg-green-50/80 p-3 rounded-r-lg rounded-bl-lg border border-green-100 relative"
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 text-xs font-bold text-green-800">
                                          <CornerDownRight size={14} />
                                          <span>
                                            {reply.admin?.fullname ||
                                              "Quản trị viên"}
                                          </span>
                                        </div>

                                        {reply.createdAt && (
                                          <span className="text-[10px] text-green-600">
                                            {new Date(
                                              reply.createdAt
                                            ).toLocaleDateString("vi-VN")}
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-sm text-gray-700 pl-5 leading-relaxed">
                                        {reply.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm sticky top-4">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Star
                        className="text-yellow-400 fill-yellow-400"
                        size={20}
                      />
                      Viết đánh giá của bạn
                    </h3>

                    {!user ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm mb-4">
                          Vui lòng đăng nhập để gửi đánh giá.
                        </p>
                        <button
                          onClick={() => navigate("/login")}
                          className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Đăng nhập ngay
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bạn cảm thấy thế nào?
                          </label>
                          <div className="flex justify-center bg-gray-50 py-3 rounded-lg border border-gray-100">
                            <StarRatingInput
                              rating={newRating}
                              setRating={setNewRating}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung nhận xét
                          </label>
                          <textarea
                            rows={4}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm p-3 outline-none transition-all"
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-md transform hover:-translate-y-0.5"
                        >
                          Gửi đánh giá
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {suggestedProducts?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Sản phẩm tương tự
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {suggestedProducts.map((prod) => (
                <ProductCard1 key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>

      {chatProductData && <CustomerChat product={chatProductData} />}

      <Footer />
    </div>
  );
}
