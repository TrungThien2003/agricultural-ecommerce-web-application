import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  keyword: "",
  category: [], //chua ca danh muc cha va danh muc con
  mainCate: [],
  price: [],
  colors: [],
};

export const parameterFilterSlice = createSlice({
  name: "keyword",
  initialState,
  reducers: {
    updateKeyword: (state, action) => {
      state.name = action.payload;
    },
    updateCategory: (state, action) => {
      state.category = action.payload;
    },
    updateMainCate: (state, action) => {
      state.mainCate = action.payload;
    },
    reset: (state) => {
      state.name = "";
      state.category = [];
      state.price = [];
      state.mainCate = [];
    },
  },
});

export const { updateKeyword, updateCategory, updateMainCate, reset } =
  parameterFilterSlice.actions;

export default parameterFilterSlice.reducer;
