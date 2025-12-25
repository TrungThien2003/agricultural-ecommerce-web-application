// Tạo tệp mới tên là StoreCategorySection.js
import React, { useState } from "react";
import ProductCard from "../../components/product/ProductCard.jsx";
import FilterSortBar from "./FilterSortBar.jsx";
import FilterModal from "../../components/filter/FilterModal.jsx";
// Dữ liệu mẫu
const products = [
  {
    name: "Strawberries",
    price: "16.00 USD",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/product-image.jpg", // Thay bằng ảnh thật
    tag: "OCOP",
  },
  {
    name: "Apples",
    price: "16.00 USD",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/product-image.jpg", // Thay bằng ảnh thật
    tag: "SAVE 12%",
  },
  {
    name: "Bananas",
    price: "16.00 USD",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/product-image.jpg", // Thay bằng ảnh thật
    tag: null, // Không có tag
  },
  {
    name: "Bananas",
    price: "16.00 USD",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/product-image.jpg", // Thay bằng ảnh thật
    tag: null, // Không có tag
  },
];

const StoreCategorySection = () => {
  return (
    <div className="w-full">
      {/* === YÊU CẦU: BANNER DANH MỤC === */}
      <section className="relative w-full h-[350px] bg-gray-200 my-12">
        {/* Ảnh nền banner */}
        <img
          src="/organic-fruit-banner.jpg"
          alt="Organic Fruits Banner"
          className="w-full h-full object-cover"
        />
        {/* Lớp phủ tối mờ */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* Nội dung banner */}
        <div className="absolute inset-0 flex items-center container mx-auto px-4 max-w-6xl">
          <div className="relative text-white w-2/5">
            {/* Đường line trang trí */}
            <div className="absolute -left-8 top-1 bottom-1 w-1 bg-green-400"></div>
            <h2 className="text-5xl font-bold mb-4">Organic Fruits</h2>
            <p className="text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quam
              pellentesque.
            </p>
          </div>
        </div>
      </section>
      {/* === KẾT THÚC BANNER === */}

      {/* === LƯỚI SẢN PHẨM === */}
      <section className="container mx-auto px-4 py-8 max-w-6xl">
        <FilterSortBar />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-9">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default StoreCategorySection;
