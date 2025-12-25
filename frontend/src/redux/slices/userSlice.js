import { createSlice } from "@reduxjs/toolkit";

const persistedUser = JSON.parse(localStorage.getItem("user")) || {};

const initialState = {
  id: persistedUser.id || "",
  name: persistedUser.name || "",
  email: persistedUser.email || "",
  isAdmin: persistedUser.isAdmin || false,
  access_token: persistedUser.access_token || "",
  isLoading: true,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const { id, name, email, isAdmin, access_token, isLoading } =
        action.payload;

      if (id !== undefined) state.id = id;
      if (name !== undefined) state.name = name || email;
      if (email !== undefined) state.email = email;
      if (isAdmin !== undefined) state.isAdmin = isAdmin;
      if (access_token !== undefined) state.access_token = access_token;

      if (isLoading !== undefined) {
        state.isLoading = isLoading;
      }
    },
    resetUser: (state) => {
      state.id = "";
      state.name = "";
      state.email = "";
      state.isAdmin = false;
      state.access_token = "";
      state.isLoading = false;
    },
  },
});

export const { updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
