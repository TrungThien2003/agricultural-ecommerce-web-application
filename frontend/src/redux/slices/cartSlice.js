import { createSlice } from "@reduxjs/toolkit";

const calculateTotalQuantity = (products) => {
  return products.reduce((total, item) => total + item.quantity, 0);
};

const getVariantStock = (productData, selectedVariantId) => {
  if (selectedVariantId === "base_product") {
    return productData.quantity || 0;
  }
  const quantityData = (productData.variantsWithQuantity || []).find(
    (q) => q._id === selectedVariantId
  );
  return quantityData?.quantity || 0;
};

const initialState = {
  products: [],
  selectedItemIds: [],
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action) => {
      const { product, selectedVariantId, quantity } = action.payload;

      const stock = getVariantStock(product, selectedVariantId);

      if (stock === 0) {
        console.warn("Attempted to add out-of-stock item.");
        return;
      }

      const existingItemIndex = state.products.findIndex(
        (item) =>
          item.productId === product._id &&
          item.selectedVariantId === selectedVariantId
      );

      if (existingItemIndex > -1) {
        const item = state.products[existingItemIndex];
        item.quantity = Math.min(stock, item.quantity + quantity);
      } else {
        state.products.push({
          productId: product._id,
          productData: product,
          selectedVariantId: selectedVariantId,
          quantity: Math.min(stock, quantity),
        });
      }

      state.totalQuantity = calculateTotalQuantity(state.products);
    },

    updateCartItemQuantity: (state, action) => {
      const { productId, selectedVariantId, newQuantity } = action.payload;
      const itemToUpdate = state.products.find(
        (item) =>
          item.productId === productId &&
          item.selectedVariantId === selectedVariantId
      );

      if (itemToUpdate) {
        const stock = getVariantStock(
          itemToUpdate.productData,
          itemToUpdate.selectedVariantId
        );
        itemToUpdate.quantity = Math.max(1, Math.min(newQuantity, stock));
      }
      state.totalQuantity = calculateTotalQuantity(state.products);
    },
    changeCartItemVariant: (state, action) => {
      const { productId, oldVariantId, newVariantId } = action.payload;

      const itemIndex = state.products.findIndex(
        (item) =>
          item.productId === productId &&
          item.selectedVariantId === oldVariantId
      );

      if (itemIndex === -1) return;

      const oldItem = state.products[itemIndex];
      const oldCartItemId = `${productId}_${oldVariantId}`;
      state.products.splice(itemIndex, 1);

      const newStock = getVariantStock(oldItem.productData, newVariantId);

      const existingNewVariantIndex = state.products.findIndex(
        (item) =>
          item.productId === productId &&
          item.selectedVariantId === newVariantId
      );

      if (existingNewVariantIndex > -1) {
        const existingItem = state.products[existingNewVariantIndex];
        existingItem.quantity = Math.min(
          newStock,
          existingItem.quantity + oldItem.quantity
        );
      } else {
        state.products.push({
          ...oldItem,
          selectedVariantId: newVariantId,
          quantity: Math.min(newStock, oldItem.quantity),
        });
      }

      if (state.selectedItemIds.includes(oldCartItemId)) {
        const newCartItemId = `${productId}_${newVariantId}`;
        state.selectedItemIds = state.selectedItemIds.filter(
          (id) => id !== oldCartItemId
        );
        if (!state.selectedItemIds.includes(newCartItemId)) {
          state.selectedItemIds.push(newCartItemId);
        }
      }
    },

    removeItemFromCart: (state, action) => {
      const { productId, selectedVariantId } = action.payload;
      state.products = state.products.filter(
        (item) =>
          item.productId !== productId ||
          item.selectedVariantId !== selectedVariantId
      );

      const cartItemId = `${productId}_${selectedVariantId}`;
      state.selectedItemIds = state.selectedItemIds.filter(
        (id) => id !== cartItemId
      );
      state.totalQuantity = calculateTotalQuantity(state.products);
    },

    setCheckoutSelection: (state, action) => {
      state.selectedItemIds = action.payload;
    },

    removeSelectedItems: (state) => {
      state.products = state.products.filter(
        (item) =>
          !state.selectedItemIds.includes(
            `${item.productId}_${item.selectedVariantId}`
          )
      );
      state.selectedItemIds = [];
      state.totalQuantity = calculateTotalQuantity(state.products);
    },

    setCart: (state, action) => {
      state.products = action.payload;
      state.selectedItemIds = [];
      state.totalQuantity = calculateTotalQuantity(state.products);
    },
    resetCart: (state) => {
      state.products = [];
      state.selectedItemIds = [];
      state.totalQuantity = 0;
    },
  },
});

export const {
  addItemToCart,
  updateCartItemQuantity,
  changeCartItemVariant,
  removeItemFromCart,
  setCheckoutSelection,
  removeSelectedItems,
  setCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
