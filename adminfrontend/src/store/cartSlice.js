import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  bundleSuggestion: null,
  subtotal: 0,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartStart: (state) => {
      state.loading = true;
    },
    setCartSuccess: (state, action) => {
      const { items, bundleSuggestion, subtotal } = action.payload;
      state.items = items || [];
      state.bundleSuggestion = bundleSuggestion || null;
      state.subtotal = subtotal || 0;
      state.loading = false;
    },
    setCartFailure: (state) => {
      state.loading = false;
    },
    clearCartState: (state) => {
      state.items = [];
      state.bundleSuggestion = null;
      state.subtotal = 0;
      state.loading = false;
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCartStart,
  setCartSuccess,
  setCartFailure,
  clearCartState,
  setCartLoading,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartBundleSuggestion = (state) => state.cart.bundleSuggestion;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartLoading = (state) => state.cart.loading;

// Reliably calculate total item count
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((acc, item) => acc + (item.quantity || 0), 0);

// Reliably calculate/validate subtotal client-side based on item properties
export const selectCalculatedSubtotal = (state) => {
  return state.cart.items.reduce((acc, item) => {
    if (item.isRental && item.rentalDays > 0) {
      const rentPrice = item.product?.rentPricePerDay || 0;
      return acc + (rentPrice * item.rentalDays * (item.quantity || 0));
    } else {
      const price = item.product?.discountPrice ?? item.product?.price ?? 0;
      return acc + (price * (item.quantity || 0));
    }
  }, 0);
};

export default cartSlice.reducer;
