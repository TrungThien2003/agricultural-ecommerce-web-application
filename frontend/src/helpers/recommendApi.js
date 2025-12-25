export const fetchRecommendations = async (
  userId,
  recentIds = [],
  limit = 10
) => {
  try {
    const API_URL = "http://127.0.0.1:8000/recommend";
    const safeRecentIds = Array.isArray(recentIds) ? recentIds : [];

    const payload = {
      user_id: userId ? String(userId) : null,
      recent_products: safeRecentIds.map(String),
      k: limit,
    };
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Status: ${response.status}`);
    }

    const result = await response.json();

    if (Array.isArray(result)) {
      console.log("[API SUCCESS] Nhận được:", result.length, "sản phẩm.");
      return result;
    } else {
      console.warn("[API WARN] Dữ liệu trả về không phải mảng:", result);
      return [];
    }
  } catch (error) {
    console.error("[API ERROR] Có lỗi xảy ra:", error);
    return [];
  }
};
