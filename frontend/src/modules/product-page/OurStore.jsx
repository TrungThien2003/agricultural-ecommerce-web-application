import StoredCategorySection from "./StoredCategorySection";

// === YÊU CẦU MỚI: BỘ LỌC NÂNG CAO ===

// === KẾT THÚC BỘ LỌC ===

const OurStore = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Section "Our Store" và Lọc Danh mục (Giữ nguyên) */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="md:w-1/2 space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-bold text-[#122423]">Our Store</h1>
            <p className="text-lg text-gray-600 max-w-md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              urna sit adipiscing leo aliquam tempor.
            </p>
          </div>

          <div className="hidden md:block w-px h-40 bg-gray-200"></div>

          <div className="md:w-1/2 flex flex-col items-center md:items-start space-y-6">
            <div className="uppercase text-sm font-semibold tracking-widest text-[#122423]">
              Explore our Products
            </div>
            {/* ... (Các nút lọc danh mục giữ nguyên) ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://farm-template.webflow.io/category/organic-fruits"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#e0f4e0] text-[#122423] font-medium text-[16px] hover:bg-[#c8eac8] transition"
              >
                <span className="text-xl">🍎</span> Organic Fruits
              </a>
              <a
                href="https://farm-template.webflow.io/category/organic-vegetables"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#e0f4e0] text-[#122423] font-medium text-[16px] hover:bg-[#c8eac8] transition"
              >
                <span className="text-xl">🥬</span> Organic Vegetables
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Component chứa Banner và Lưới Sản phẩm */}
      <StoredCategorySection />
    </div>
  );
};

export default OurStore;
