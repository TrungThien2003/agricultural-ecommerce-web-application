import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

// 1. Gộp các reducer của bạn
const rootReducer = combineReducers({
  cart: cartReducer,
  user: userReducer,
  // Thêm các reducer khác ở đây nếu cần
});

// 2. Cấu hình để persist CẢ HAI
const persistConfig = {
  key: "root",
  storage,
  // SỬA: Thêm 'user' vào whitelist
  whitelist: ["cart", "user"],
};

// 3. Tạo reducer đã được persist
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Cấu hình store
export const store = configureStore({
  // SỬA: Chỉ cần truyền 'persistedReducer' vào đây
  reducer: persistedReducer,

  // SỬA: Di chuyển 'middleware' ra ngoài làm key riêng
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),

  // SỬA: Xóa bỏ 'preloadedState' vì 'redux-persist' sẽ tự động làm việc này
});

export const persistor = persistStore(store);
