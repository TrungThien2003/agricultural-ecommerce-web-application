import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp, FiFilter, FiTag } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import CategoryPanel from "./CategoryPanel";
import FilterPanel from "./FilterPanel";

export default function SidebarClient({
  selectedCategory,
  onCategoryChange,
  activeFilters,
  onFilterChange,
}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    filter: true,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/types/tree");
        const data = await res.json();
        console.log("data types", data);
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-8
                 self-start flex flex-col gap-4 max-h-[85vh] overflow-y-auto
                 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <AnimatePresence initial={false}>
        {openSections.category && (
          <motion.div
            key="category-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="max-h-[45vh] overflow-y-auto p-3">
              <CategoryPanel
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection("filter")}
          className="w-full flex items-center justify-between p-4 font-semibold
                     text-[#0a3d2e] text-lg bg-[#eaf6ef] hover:bg-[#dff4e7] transition-colors"
        >
          <div className="flex items-center gap-2">
            <FiFilter className="text-[#3ca66b]" />
            <span>Bộ lọc</span>
          </div>
          {openSections.filter ? (
            <FiChevronUp className="text-[#3ca66b]" />
          ) : (
            <FiChevronDown className="text-[#3ca66b]" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {openSections.filter && (
            <motion.div
              key="filter-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="max-h-[45vh] overflow-y-auto p-3">
                <FilterPanel
                  activeFilters={activeFilters}
                  onFilterChange={onFilterChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
