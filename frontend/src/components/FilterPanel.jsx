import React, { useState, useEffect } from "react";
import { FiFilter, FiLoader } from "react-icons/fi";
const API_BASE_URL = "http://localhost:5000/api";

function FilterPanel({ activeFilters, onFilterChange }) {
  const [standards, setStandards] = useState([]);
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [standardsRes, methodsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/standards`),
          fetch(`http://localhost:5000/api/methods`),
        ]);

        if (!standardsRes.ok || !methodsRes.ok) {
          throw new Error("Không thể tải dữ liệu bộ lọc");
        }

        const standardsData = await standardsRes.json();
        const methodsData = await methodsRes.json();
        console.log("Fetched standards:", standardsData);
        console.log("Fetched methods:", methodsData);

        setStandards(standardsData.standards);
        setMethods(methodsData.methods);
      } catch (err) {
        setError(err.message);
        console.log("Lỗi khi tải bộ lọc:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const handleFilterChange = (type, value) => {
    const currentValues = activeFilters[type];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    onFilterChange(type, newValues);
  };

  const renderCheckbox = (item, type) => (
    <label
      key={item._id}
      className="flex items-center w-full p-3 rounded-lg text-gray-700 font-medium 
                 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
    >
      <input
        type="checkbox"
        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
        onChange={() => handleFilterChange(type, item._id)}
        checked={activeFilters[type].includes(item._id)}
      />
      <span className="ml-3">{item.name}</span>
    </label>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <FiLoader className="animate-spin text-blue-500" size={24} />
          <span className="ml-2 text-gray-600">Đang tải bộ lọc...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-32">
          <span className="text-red-500">{error}</span>
        </div>
      );
    }

    return (
      <>
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">
            Tiêu chuẩn sản phẩm
          </h4>
          <div className="space-y-1">
            {standards &&
              standards.map((std) => renderCheckbox(std, "standards"))}
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        <div>
          <h4 className="font-semibold text-gray-700 mb-3">
            Phương thức canh tác
          </h4>
          <div className="space-y-1">
            {methods && methods?.map((mth) => renderCheckbox(mth, "methods"))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 mt-6">
      {renderContent()}
    </div>
  );
}

export default FilterPanel;
