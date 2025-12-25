import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  MessageSquare,
  Star,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  CornerDownRight,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function CommentManager() {
  const user = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20, // Số lượng bình luận mỗi trang (tăng lên 20 cho dễ nhìn)
    totalPages: 1,
    totalDocs: 0,
  });

  // State thống kê & dữ liệu bổ trợ
  const [totalUnreplied, setTotalUnreplied] = useState(0);
  const [productsList, setProductsList] = useState([]);

  // State bộ lọc
  const [filter, setFilter] = useState({
    status: "",
    rating: "",
    productId: "",
    replyStatus: "",
  });

  // State Modal Reply
  const [replyModal, setReplyModal] = useState({
    isOpen: false,
    commentId: null,
    commentContent: "",
    user: "",
  });
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // --- 1. FETCH DATA ---

  // A. Lấy danh sách sản phẩm (để nạp vào Dropdown lọc)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gọi API lấy danh sách sản phẩm (giới hạn 100 hoặc tạo API dropdown riêng)
        const res = await axios.get(
          "http://localhost:5000/api/products?limit=100"
        );
        setProductsList(res.data.products || []);
      } catch (err) {
        console.error("Lỗi tải danh sách sản phẩm cho bộ lọc");
      }
    };
    fetchProducts();
  }, []);

  // B. Lấy Comment & Thống kê
  const fetchComments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // Gắn các tham số lọc vào URL
      if (filter.status) queryParams.append("status", filter.status);
      if (filter.rating) queryParams.append("rating", filter.rating);
      if (filter.productId) queryParams.append("productId", filter.productId); // ĐÃ SỬA LỖI TẠI ĐÂY
      if (filter.replyStatus)
        queryParams.append("replyStatus", filter.replyStatus);

      queryParams.append("page", pagination.page);
      queryParams.append("limit", pagination.limit);

      const res = await axios.get(
        `http://localhost:5000/api/comments/admin/all?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );

      setComments(res.data.comments || []);
      setTotalUnreplied(res.data.totalUnreplied || 0);
      setPagination((prev) => ({
        ...prev,
        totalPages: res.data.totalPages,
        totalDocs: res.data.total,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter, pagination.page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };
  const handleToggleHide = async (id, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/comments/${id}/toggle-hidden`,
        {},
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );

      // Cập nhật UI ngay lập tức (Optimistic Update)
      setComments((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isHidden: !currentStatus } : c))
      );
      toast.success(currentStatus ? "Đã hiện bình luận" : "Đã ẩn bình luận");
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn đánh giá này?"))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/comments/admin/${id}`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });

      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.success("Đã xóa bình luận.");
    } catch (error) {
      toast.error("Lỗi khi xóa bình luận.");
    }
  };

  const openReplyModal = (comment) => {
    setReplyModal({
      isOpen: true,
      commentId: comment._id,
      commentContent: comment.content,
      user: comment.user?.fullname,
    });
    setReplyContent("");
  };

  const submitReply = async () => {
    if (!replyContent.trim()) return toast.warning("Vui lòng nhập nội dung.");
    setSendingReply(true);
    try {
      await axios.post(
        `http://localhost:5000/api/comments/${replyModal.commentId}/reply`,
        { content: replyContent },
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );
      toast.success("Đã gửi phản hồi!");
      setReplyModal({ ...replyModal, isOpen: false });
      fetchComments(); // Reload để hiện phản hồi mới
    } catch (error) {
      toast.error("Lỗi khi gửi phản hồi.");
    } finally {
      setSendingReply(false);
    }
  };

  const renderStars = (rating) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? "currentColor" : "none"}
          className={i >= rating ? "text-gray-300" : ""}
        />
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-green-600" /> Quản lý Đánh giá
          </h1>
          <p className="text-sm text-gray-500">
            Kiểm duyệt và trả lời phản hồi khách hàng.
          </p>
        </div>
        <button
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm transition-all cursor-pointer
            ${
              filter.replyStatus === "unreplied"
                ? "bg-red-50 border-red-200 ring-2 ring-red-200"
                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          onClick={() =>
            setFilter({
              ...filter,
              replyStatus:
                filter.replyStatus === "unreplied" ? "" : "unreplied",
            })
          }
        >
          <div
            className={`p-2 rounded-full ${
              totalUnreplied > 0
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {totalUnreplied > 0 ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Chưa phản hồi
            </p>
            <h3
              className={`text-xl font-bold ${
                totalUnreplied > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {totalUnreplied}{" "}
              <span className="text-sm font-normal text-gray-400">
                bình luận
              </span>
            </h3>
          </div>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-2.5 rounded-lg mr-2">
          <Filter size={18} />{" "}
          <span className="text-sm font-bold">Bộ lọc:</span>
        </div>

        <select
          className="bg-white border border-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2.5 min-w-[220px] max-w-[300px]"
          value={filter.productId}
          onChange={(e) => setFilter({ ...filter, productId: e.target.value })}
        >
          <option value="">-- Tất cả sản phẩm --</option>
          {productsList.map((prod) => (
            <option key={prod._id} value={prod._id}>
              {prod.name.length > 40
                ? prod.name.substring(0, 40) + "..."
                : prod.name}
            </option>
          ))}
        </select>

        <select
          className="bg-white border border-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2.5"
          value={filter.replyStatus}
          onChange={(e) =>
            setFilter({ ...filter, replyStatus: e.target.value })
          }
        >
          <option value="">Tất cả phản hồi</option>
          <option value="unreplied">Chưa trả lời</option>
          <option value="replied">Đã trả lời</option>
        </select>

        <select
          className="bg-white border border-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2.5"
          value={filter.rating}
          onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
        >
          <option value="">Mọi đánh giá</option>
          <option value="5">5 Sao</option>
          <option value="4">4 Sao</option>
          <option value="3">3 Sao</option>
          <option value="2">2 Sao</option>
          <option value="1">1 Sao</option>
        </select>

        {/* 4. Dropdown Ẩn/Hiện */}
        <select
          className="bg-white border border-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2.5"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">Mọi trạng thái</option>
          <option value="visible">Đang hiển thị</option>
          <option value="hidden">Đang ẩn</option>
        </select>

        {/* Nút Reset Lọc */}
        <button
          onClick={() =>
            setFilter({
              status: "",
              rating: "",
              productId: "",
              replyStatus: "",
            })
          }
          className="ml-auto text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2.5 rounded-lg transition font-medium flex items-center gap-1"
        >
          <X size={16} /> Xóa lọc
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-2" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
              <MessageSquare size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700">
              Không tìm thấy đánh giá nào.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Thử thay đổi bộ lọc hoặc chọn sản phẩm khác.
            </p>
            <button
              onClick={() =>
                setFilter({
                  status: "",
                  rating: "",
                  productId: "",
                  replyStatus: "",
                })
              }
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Xem tất cả đánh giá
            </button>
          </div>
        ) : (
          <div className="ooverflow-x-auto overflow-y-auto max-h-[65vh] relative custom-scrollbar">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 w-[25%]">Sản phẩm</th>
                  <th className="px-6 py-4 w-[15%]">Khách hàng</th>
                  <th className="px-6 py-4 w-[10%]">Đánh giá</th>
                  <th className="px-6 py-4 w-[35%]">Nội dung</th>
                  <th className="px-6 py-4 text-right w-[15%]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comments.map((item) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      item.replies?.length === 0 ? "bg-red-50/40" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs">
                              N/A
                            </div>
                          )}
                        </div>
                        <span
                          className="font-medium text-gray-800 line-clamp-2 leading-tight"
                          title={item.product?.name}
                        >
                          {item.product?.name || (
                            <span className="text-red-400 italic">
                              Sản phẩm đã xóa
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {item.user?.fullname || "Người dùng ẩn danh"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {renderStars(item.rating)}
                      <div className="text-xs text-gray-400 mt-1 font-medium">
                        {item.rating}/5 Tuyệt vời
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-gray-800 mb-2 font-medium text-[15px]">
                        "{item.content}"
                      </p>
                      {item.replies && item.replies.length > 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                          <div className="space-y-1.5 overflow-y-auto max-h-[80px] pr-1 custom-scrollbar">
                            {item.replies.map((reply, idx) => (
                              <div
                                key={idx}
                                className="text-xs border-l-2 border-green-500 pl-3 ml-1"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-green-700 flex items-center gap-1">
                                    <CornerDownRight size={10} />
                                    {reply.admin?.fullname || "Admin"}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(
                                      reply.createdAt || Date.now()
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <p className="text-gray-600 leading-snug bg-white p-1.5 rounded border border-gray-100 shadow-sm">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 mt-1">
                          <AlertCircle size={10} /> Chưa trả lời
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openReplyModal(item)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 shadow-sm"
                          title="Trả lời"
                        >
                          <CornerDownRight size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleHide(item._id, item.isHidden)
                          }
                          className={`p-2 rounded-lg border shadow-sm ${
                            item.isHidden
                              ? "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                              : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                          }`}
                          title={
                            item.isHidden
                              ? "Đang ẩn (Bấm để hiện)"
                              : "Đang hiện (Bấm để ẩn)"
                          }
                        >
                          {item.isHidden ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 shadow-sm"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Hiển thị <strong>{comments.length}</strong> /{" "}
            <strong>{pagination.totalDocs}</strong> kết quả
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700">
              Trang {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      {replyModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CornerDownRight size={20} className="text-blue-600" /> Phản hồi
                đánh giá
              </h3>
              <button
                onClick={() => setReplyModal({ ...replyModal, isOpen: false })}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm relative">
                <div className="absolute top-[-10px] left-4 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                  Khách hàng
                </div>
                <p className="font-bold text-gray-800 mb-1">
                  {replyModal.user}
                </p>
                <p className="text-gray-600 italic">
                  "{replyModal.commentContent}"
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Câu trả lời của Cửa hàng:
                </label>
                <textarea
                  rows={5}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm shadow-sm transition-all"
                  placeholder="Nhập nội dung cảm ơn hoặc giải đáp thắc mắc..."
                  autoFocus
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setReplyModal({ ...replyModal, isOpen: false })}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitReply}
                disabled={sendingReply}
                className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-70"
              >
                {sendingReply ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Gửi phản hồi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
