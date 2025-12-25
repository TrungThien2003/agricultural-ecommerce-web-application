import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, Tag, Check } from "lucide-react";

const slideVariants = {
  enter: { x: "100%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

export default function CategoryPanel({
  categories = [],
  onCategoryChange,
  selectedCategory,
}) {
  const [history, setHistory] = useState([
    { level: "root", items: categories },
  ]);
  const currentLevel = history[history.length - 1];

  useEffect(() => {
    setHistory([{ level: "root", items: categories }]);
  }, [categories]);

  const handleSelectCategory = (category) => {
    onCategoryChange?.(category._id);
    if (category.children && category.children.length > 0) {
      setHistory((prev) => [
        ...prev,
        { level: category.name, items: category.children },
      ]);
    }
  };

  const handleBack = () => {
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleDeselectAll = () => {
    onCategoryChange?.(null);
    if (history.length > 1) {
      setHistory((prev) => [prev[0]]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b bg-green-50">
        <div className="flex items-center gap-2 font-semibold text-green-700">
          <Tag size={18} />
          {currentLevel.level === "root"
            ? "Danh mục sản phẩm"
            : currentLevel.level}
        </div>
        {history.length > 1 && (
          <button
            onClick={handleBack}
            className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        )}
      </div>

      <div className="relative min-h-[200px] h-64 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentLevel.level}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="absolute inset-0 grid grid-cols-1 gap-2 p-4 overflow-y-auto 
                       scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100"
          >
            {currentLevel.level === "root" && (
              <button
                onClick={handleDeselectAll}
                className={`flex items-center justify-between p-3 rounded-xl transition-all
                  ${
                    selectedCategory === null
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "bg-gray-50 hover:bg-green-50 border border-gray-100"
                  }`}
              >
                <span className="font-semibold text-green-800">
                  Tất cả sản phẩm
                </span>
                {selectedCategory === null && (
                  <Check size={18} className="text-green-700" />
                )}
              </button>
            )}

            {currentLevel.items.map((cat) => {
              const isActive = selectedCategory === cat._id;

              return (
                <button
                  key={cat._id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all text-left
                    ${
                      isActive
                        ? "bg-green-100 text-green-700 font-semibold"
                        : "bg-gray-50 hover:bg-green-50 border border-gray-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{cat.name}</span>
                  </div>

                  {cat.children?.length > 0 ? (
                    <ChevronRight size={18} className="text-gray-400" />
                  ) : isActive ? (
                    <Check size={18} className="text-green-700" />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
