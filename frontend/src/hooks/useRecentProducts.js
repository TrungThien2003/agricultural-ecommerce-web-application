import { useState, useEffect } from "react";

const STORAGE_KEY = "recent_viewed_ids";

const useRecentProducts = () => {
  const [recentIds, setRecentIds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const addToRecent = (productId) => {
    setRecentIds((prevIds) => {
      const filtered = prevIds.filter((id) => id !== productId);

      const newBusket = [productId, ...filtered];

      const finalBusket = newBusket.slice(0, 5);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalBusket));

      return finalBusket;
    });
  };

  return { recentIds, addToRecent };
};

export default useRecentProducts;
