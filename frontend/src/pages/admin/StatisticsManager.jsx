import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Download,
  Loader2,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  AlertOctagon,
  Clock,
  QrCode,
} from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ============================================================================
// 1. CẤU HÌNH & HELPER FUNCTIONS
// ============================================================================

// Format tiền tệ VND
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0
  );

// Format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const renderVariantLabel = (variant, unit, weight) => {
  // Case 1: Là biến thể cụ thể
  if (variant && variant.trim() !== "") {
    return (
      <span className="inline-block text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
        {variant}
      </span>
    );
  }

  // Case 2: Là sản phẩm gốc (hiển thị quy cách đóng gói)
  const unitText = unit || "Đơn vị";
  const weightText = weight ? ` ${weight}kg` : "";

  return (
    <span className="inline-block text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-medium">
      ({unitText}
      {weightText})
    </span>
  );
};

// ============================================================================
// 2. COMPONENT CHÍNH: STATISTICS MANAGER
// ============================================================================

export default function StatisticsManager() {
  const [activeTab, setActiveTab] = useState("revenue"); // 'revenue' | 'inventory'
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [revenueStats, setRevenueStats] = useState({
    chartData: [],
    overview: {
      totalRevenue: 0,
      totalProfit: 0,
      totalOrders: 0,
      profitMargin: "0%",
    },
    categoryShare: [],
    topProducts: [],
    paymentMethodStats: [],
  });

  const [inventoryStats, setInventoryStats] = useState({
    summary: { totalValue: 0, totalQuantity: 0 },
    stockByCategory: [],
    expiringBatches: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "revenue") {
        // Load dữ liệu Doanh thu
        const [revenueRes, productRes] = await Promise.all([
          axios.get("http://localhost:5000/api/stats/revenue", {
            params: dateFilter,
          }),
          axios.get("http://localhost:5000/api/stats/products", {
            params: dateFilter,
          }),
        ]);

        setRevenueStats({
          chartData: revenueRes.data.chartData || [],
          overview: revenueRes.data.overview || {},
          paymentMethodStats: revenueRes.data.paymentMethodStats || [],
          categoryShare: productRes.data.categoryShare || [],
          topProducts: productRes.data.topProducts || [],
        });
      } else {
        const inventoryRes = await axios.get(
          "http://localhost:5000/api/stats/inventory"
        );
        setInventoryStats({
          summary: inventoryRes.data.summary || {
            totalValue: 0,
            totalQuantity: 0,
          },
          stockByCategory: inventoryRes.data.stockByCategory || [],
          expiringBatches: inventoryRes.data.expiringBatches || [],
        });
      }
    } catch (error) {
      console.error("Lỗi API:", error);
      toast.error("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, dateFilter.startDate, dateFilter.endDate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
        <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="font-medium text-lg">Đang phân tích số liệu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-gray-50 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER & FILTER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-green-600" size={28} />
            Báo Cáo Hiệu Quả Kinh Doanh
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng hợp doanh thu, lợi nhuận ròng và quản lý kho hàng chi tiết.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {activeTab === "revenue" && (
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg p-1.5 px-3 shadow-inner">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, startDate: e.target.value })
                }
                className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 outline-none cursor-pointer"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, endDate: e.target.value })
                }
                className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 outline-none cursor-pointer"
              />
            </div>
          )}
          <button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-sm transition-all text-sm font-medium">
            <Download size={18} /> Xuất Báo Cáo
          </button>
        </div>
      </div>

      <div className="flex p-1 bg-gray-200/80 rounded-xl w-fit border border-gray-300">
        <TabButton
          active={activeTab === "revenue"}
          onClick={() => setActiveTab("revenue")}
          icon={<DollarSign size={18} />}
          label="Doanh Thu & Lợi Nhuận"
          colorClass="text-green-700"
        />
        <TabButton
          active={activeTab === "inventory"}
          onClick={() => setActiveTab("inventory")}
          icon={<Package size={18} />}
          label="Quản Lý Kho Hàng"
          colorClass="text-blue-700"
        />
      </div>

      {/* VIEW CONTENT */}
      {activeTab === "revenue" ? (
        <RevenueView stats={revenueStats} />
      ) : (
        <InventoryView stats={inventoryStats} />
      )}
    </div>
  );
}

const RevenueView = ({ stats }) => {
  const {
    overview,
    chartData,
    topProducts,
    paymentMethodStats,
    categoryShare,
  } = stats;

  const totalPaymentValue = paymentMethodStats.reduce(
    (acc, cur) => acc + cur.value,
    0
  );
  const totalCategoryValue = categoryShare.reduce(
    (acc, cur) => acc + cur.value,
    0
  );

  const CATEGORY_COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Doanh Thu Tổng"
          value={formatCurrency(overview.totalRevenue)}
          icon={<DollarSign size={24} />}
          color="green"
          subText="Đã trừ chiết khấu"
        />
        <SummaryCard
          title="Lợi Nhuận Ròng"
          value={formatCurrency(overview.totalProfit)}
          icon={<TrendingUp size={24} />}
          color="indigo"
          subText="Thực tế (Doanh thu - Giá vốn)"
          highlight
        />
        <SummaryCard
          title="Tỷ Suất Lợi Nhuận"
          value={overview.profitMargin}
          icon={<PieChart size={24} />}
          color="purple"
          subText="Biên lợi nhuận trung bình"
        />
        <SummaryCard
          title="Tổng Đơn Hàng"
          value={overview.totalOrders}
          icon={<ShoppingBag size={24} />}
          color="blue"
          subText="Đơn hàng thành công"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-6 text-lg">
          Biểu đồ Tăng Trưởng Doanh Thu & Lợi Nhuận
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000000}M`}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(val) => formatCurrency(val)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorRev)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Lợi nhuận"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorProfit)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[350px]">
          <h3 className="font-bold text-gray-700 mb-2 border-b pb-2">
            Nguồn Doanh Thu
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name.includes("VNPAY") ? "#005BAA" : "#10B981"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const percent =
                      totalPaymentValue > 0
                        ? ((value / totalPaymentValue) * 100).toFixed(1)
                        : 0;
                    return [
                      `${formatCurrency(value)} (${percent}%)`,
                      "Giá trị",
                    ];
                  }}
                />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[350px]">
          <h3 className="font-bold text-gray-700 mb-2 border-b pb-2">
            Tỷ Trọng Theo Danh Mục
          </h3>
          <div className="flex-1 w-full">
            {categoryShare && categoryShare.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="_id"
                  >
                    {categoryShare.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      const percent =
                        totalCategoryValue > 0
                          ? ((value / totalCategoryValue) * 100).toFixed(1)
                          : 0;
                      return [
                        `${formatCurrency(value)} (${percent}%)`,
                        "Doanh thu",
                      ];
                    }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Chưa có dữ liệu danh mục
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="text-yellow-500" size={20} /> Top 5 Sản Phẩm
          Bán Chạy Nhất
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4 text-right">Đã bán</th>
                <th className="py-3 px-4 text-right">Tổng Doanh Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {item.sold}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    {formatCurrency(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InventoryView = ({ stats }) => {
  const { summary, stockByCategory, expiringBatches } = stats;
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredStock =
    filterCategory === "all"
      ? stockByCategory
      : stockByCategory.filter((cat) => cat._id === filterCategory);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="Tổng Giá Trị Kho Hàng"
          value={formatCurrency(summary.totalValue)}
          icon={<DollarSign size={24} />}
          color="blue"
          subText="Tổng vốn nhập kho hiện tại"
        />
        <SummaryCard
          title="Tổng Sản Phẩm Tồn"
          value={summary.totalQuantity.toLocaleString()}
          icon={<Package size={24} />}
          color="purple"
          subText="Đơn vị sản phẩm (bao gồm mọi biến thể)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Package size={20} className="text-blue-500" /> Chi Tiết Tồn Kho
            </h3>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                className="text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {stockByCategory.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat._id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredStock.map((category) => (
              <CategoryAccordion key={category._id} categoryData={category} />
            ))}
            {filteredStock.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl text-gray-400">
                Không có dữ liệu tồn kho
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                <AlertOctagon size={20} /> Cần Xả Hàng Gấp
              </h3>
              <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-bold">
                {expiringBatches.length} Lô
              </span>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
              {expiringBatches.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã Lô</th>
                      <th className="px-3 py-2 text-left">Sản phẩm</th>
                      <th className="px-3 py-2 text-center">Hạn SD</th>
                      <th className="px-3 py-2 text-right">SL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expiringBatches.map((batch, idx) => (
                      <tr key={idx} className="hover:bg-red-50/50 transition">
                        <td className="px-3 py-3 align-top">
                          <div
                            className="flex items-center gap-1 font-mono text-[10px] bg-white border border-gray-300 rounded px-1.5 py-0.5 text-gray-600 w-fit cursor-help shadow-sm"
                            title={`Full ID: ${batch.batchId}`}
                          >
                            <QrCode size={10} className="text-gray-400" />#
                            {String(batch.batchId).slice(-6).toUpperCase()}
                          </div>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <div className="font-medium text-gray-800 text-sm leading-tight">
                            {batch.productName}
                          </div>
                          <div className="mt-1">
                            {renderVariantLabel(
                              batch.variant,
                              batch.unit,
                              batch.weight
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center align-top">
                          <div className="text-red-600 font-bold text-xs">
                            {Math.ceil(batch.daysLeft)} ngày
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {formatDate(batch.expiryDate)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-gray-700 align-top">
                          {batch.remaining}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-green-600">
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Không có lô hàng nào sắp hết hạn (30 ngày).
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">
              Top Danh Mục Tồn Kho (Theo Giá trị)
            </h3>
            <div className="h-[200px]">
              {(() => {
                const chartData = stockByCategory
                  .map((cat) => ({
                    name: cat._id,
                    totalValue: cat.products.reduce(
                      (acc, p) => acc + (p.value || 0),
                      0
                    ),
                  }))
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .slice(0, 5);

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                      />
                      <Tooltip
                        formatter={(val) => [
                          formatCurrency(val),
                          "Giá trị tồn",
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="totalValue"
                        fill="#3B82F6"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryAccordion = ({ categoryData }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between p-4 cursor-pointer select-none ${
          isOpen ? "bg-blue-50/50" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              isOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
            }`}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-lg">
              {categoryData._id}
            </h4>
            <p className="text-xs text-gray-500">
              Tổng tồn:{" "}
              <span className="font-semibold text-gray-700">
                {categoryData.totalCategoryStock}
              </span>{" "}
              sp
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-sm font-bold text-blue-600">
            {formatCurrency(
              categoryData.products.reduce(
                (acc, cur) => acc + (cur.value || 0),
                0
              )
            )}
          </div>
          <div className="text-[10px] text-gray-400 uppercase">Giá trị tồn</div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-5 py-3 pl-12">Sản phẩm / Quy cách</th>
                  <th className="px-5 py-3 text-right">Số lượng tồn</th>
                  <th className="px-5 py-3 text-right">Giá trị vốn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categoryData.products.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 pl-12">
                      <div className="flex items-center gap-3">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt=""
                            className="w-9 h-9 rounded object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                            <Package size={16} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-800">
                            {prod.productName}
                          </div>
                          <div className="mt-1">
                            {/* Hiển thị Variant Label */}
                            {renderVariantLabel(
                              prod.variant,
                              prod.unit,
                              prod.weight
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-bold ${
                          prod.stock <= 10 ? "text-red-500" : "text-gray-700"
                        }`}
                      >
                        {prod.stock.toLocaleString()}
                      </span>
                      {prod.stock <= 10 && (
                        <AlertTriangle
                          size={12}
                          className="inline ml-1 text-red-500"
                        />
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600 font-medium">
                      {formatCurrency(prod.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
      active
        ? `bg-white ${colorClass} shadow-sm ring-1 ring-gray-200`
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
    }`}
  >
    {icon} {label}
  </button>
);

const SummaryCard = ({ title, value, icon, color, subText, highlight }) => {
  const colors = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div
      className={`p-5 rounded-xl border transition-shadow hover:shadow-md ${
        highlight
          ? "bg-indigo-50/50 border-indigo-100"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3
            className={`text-2xl font-bold ${
              highlight ? "text-indigo-700" : "text-gray-800"
            }`}
          >
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-lg ${colors[color] || "bg-gray-100"}`}>
          {icon}
        </div>
      </div>
      {subText && <p className="text-xs text-gray-400 mt-2">{subText}</p>}
    </div>
  );
};
