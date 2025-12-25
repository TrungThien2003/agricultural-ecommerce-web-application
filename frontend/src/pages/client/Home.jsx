import React, { useState, useEffect, useCallback } from "react";
import { simulateFetchProducts } from "../../data/mockData";
import useDebounce from "../../hooks/useDebounce";
import SidebarClient from "../../components/SidebarClient";
import MainContent from "../../components/MainContent";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import axios from "axios";
import VariantSelectionModal from "../../components/product/VariantSelectionModal";
import { ToastContainer, toast } from "react-toastify";

import { useSelector } from "react-redux";

function Home() {
  const PAGE_LIMIT = 12;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const user = useSelector((state) => state.user);
  const [activeFilters, setActiveFilters] = useState({
    standards: [],
    methods: [],
  });

  const [sortBy, setSortBy] = useState("best-selling");
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenAddToCartModal = (product) => {
    if (user.access_token == null) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    console.log("user o home", user);
  }, [user]);

  const debouncedFilters = useDebounce(activeFilters, 500);
  const debouncedCategory = useDebounce(selectedCategory, 500);
  const debouncedKeyword = useDebounce(keyword, 500);

  const fetchProducts = useCallback(async (query, append) => {
    setIsLoading(true);
    setError(null);
    try {
      const paramsToSend = {
        ...query,
        page: query.page,
        limit: PAGE_LIMIT,
      };

      if (!paramsToSend.category) {
        delete paramsToSend.category;
      }
      if (paramsToSend.standards?.length === 0) {
        delete paramsToSend.standards;
      }
      if (paramsToSend.methods?.length === 0) {
        delete paramsToSend.methods;
      }
      const data = await axios.get("http://localhost:5000/api/products", {
        params: paramsToSend, // <-- Sửa ở đây
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          for (const key in params) {
            const value = params[key];
            if (Array.isArray(value)) {
              value.forEach((item) => {
                searchParams.append(key, item);
              });
            } else if (value != null) {
              searchParams.append(key, value);
            }
          }
          return searchParams.toString();
        },
      });

      const newProducts = data.data.products || [];
      const totalCount = data.data.totalCount || 0;

      setTotalPages(data.data.totalPages || Math.ceil(totalCount / PAGE_LIMIT));

      if (append) {
        setProducts((prev) => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      console.log("du lieu o trang chu", data);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const query = {
      category: selectedCategory,
      name: debouncedKeyword,
      standards: debouncedFilters.standards,
      methods: debouncedFilters.methods,
      sort: sortBy,
      page: page,
    };
    const shouldAppend = page > 1;

    fetchProducts(query, shouldAppend);
    console.log("query o home", query);
  }, [
    debouncedKeyword,
    debouncedCategory,
    page,
    debouncedFilters,
    sortBy,
    fetchProducts,
  ]);

  useEffect(() => {
    setPage(1);
    console.log("products o home", user);
  }, [debouncedKeyword, debouncedCategory, debouncedFilters, sortBy]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterChange = (type, newValues) => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [type]: newValues,
    }));
  };

  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />
      <Header keyword={keyword} onSearchChange={setKeyword}></Header>
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8 lg:items-start">
          <SidebarClient
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />

          <MainContent
            onAddToCartClick={handleOpenAddToCartModal}
            products={products}
            isLoading={isLoading}
            error={error}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            currentPage={page}
            totalPages={totalPages}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
      <Footer></Footer>
      {isModalOpen && selectedProduct && (
        <VariantSelectionModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Home;
