import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronRight, FiLoader, FiAlertTriangle } from "react-icons/fi";
import ProductCard1 from "./product/ProductCard1";

const ProductListArea = ({ products, isLoading, error, onAddToCartClick }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FiLoader className="animate-spin text-green-600" size={40} />
        <span className="ml-3 text-xl font-medium text-gray-600">
          Đang tải sản phẩm...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl font-medium text-red-600 flex items-center">
          <FiAlertTriangle className="mr-2" size={24} />
          {error}
        </div>
      </div>
    );
  }

  if (products?.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl font-medium text-gray-600">
          Không tìm thấy sản phẩm nào.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {products?.map((product) => (
        <ProductCard1
          onAddToCartClick={onAddToCartClick}
          key={product._id}
          product={product}
        />
      ))}
    </div>
  );
};

const SuggestedProductsSection = () => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products?limit=4&sort=rating-desc`
        );
        setSuggestedProducts(res.data.products || []);
      } catch (err) {
        console.error("Lỗi tải sản phẩm đề xuất:", err);
        setError("Không thể tải sản phẩm đề xuất.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedProducts();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 flex justify-center py-8">
        <FiLoader className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2 text-sm text-gray-500">Đang tải đề xuất...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 text-center text-red-500 py-4 font-medium">
        <FiAlertTriangle size={20} className="inline mr-2" />
        {error}
      </div>
    );
  }

  if (suggestedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        ✨ Sản phẩm nổi bật dành cho bạn
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {suggestedProducts.map((prod) => (
          <ProductCard1 key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
};

function MainContent({
  products,
  isLoading,
  error,
  sortBy,
  onSortChange,
  onAddToCartClick,
  currentPage,
  totalPages,
  onLoadMore,
}) {
  return (
    <main className="w-full lg:flex-1 mt-8 lg:mt-0">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-700 mb-2 md:mb-0">
          {!isLoading && (
            <>
              Tìm thấy{" "}
              <span className="font-semibold text-gray-900">
                {products?.length}
              </span>{" "}
              sản phẩm
            </>
          )}
        </p>
        <div className="flex items-center">
          <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
            Sắp xếp theo:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="best-selling">Bán chạy nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="hsd">Hạn dùng: Lâu nhất</option>
          </select>
        </div>
      </div>
      <ProductListArea
        products={products}
        isLoading={isLoading}
        error={error}
        onAddToCartClick={onAddToCartClick}
      />
      {!isLoading && products.length > 0 && currentPage < totalPages && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <FiLoader className="animate-spin inline mr-2" size={20} />
            ) : null}
            Xem thêm sản phẩm (Đã xem {currentPage} / {totalPages} trang)
          </button>
        </div>
      )}
      <SuggestedProductsSection />
    </main>
  );
}

export default MainContent;
