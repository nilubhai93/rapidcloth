import { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cartAPI } from '../api';
import { useAuth } from './AuthContext';
import {
  setCartStart,
  setCartSuccess,
  setCartFailure,
  clearCartState,
  setCartLoading,
  selectCartItems,
  selectCartBundleSuggestion,
  selectCartSubtotal,
  selectCartLoading,
  selectCartItemCount,
} from '../store/cartSlice';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);
  const bundleSuggestion = useSelector(selectCartBundleSuggestion);
  const subtotal = useSelector(selectCartSubtotal);
  const loading = useSelector(selectCartLoading);
  const itemCount = useSelector(selectCartItemCount);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch(clearCartState());
      return;
    }
    dispatch(setCartStart());
    try {
      const res = await cartAPI.get();
      dispatch(setCartSuccess({
        items: res.data.items || [],
        bundleSuggestion: res.data.bundleSuggestion || null,
        subtotal: res.data.subtotal || 0,
      }));
    } catch (e) {
      console.error('Fetch cart error:', e);
      dispatch(setCartFailure());
    }
  }, [isAuthenticated, dispatch]);

  // Re-fetch cart whenever auth state changes (login, refresh, token change)
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, size, color, quantity = 1, isRental = false, rentalDays = 0) => {
    dispatch(setCartLoading(true));
    try {
      const payload = { productId, size, color, quantity };
      if (isRental) {
        payload.isRental = true;
        payload.rentalDays = rentalDays;
      }
      const res = await cartAPI.add(payload);
      if (res.data.cart) {
        await fetchCart();
      }
      return res.data;
    } catch (e) {
      dispatch(setCartLoading(false));
      throw e.response?.data || e;
    }
  };

  const updateItem = async (itemId, quantity) => {
    dispatch(setCartLoading(true));
    try {
      await cartAPI.update(itemId, { quantity });
      await fetchCart();
    } catch (e) {
      dispatch(setCartLoading(false));
      console.error('Update cart item error:', e);
    }
  };

  const removeItem = async (itemId) => {
    dispatch(setCartLoading(true));
    try {
      await cartAPI.remove(itemId);
      await fetchCart();
    } catch (e) {
      dispatch(setCartLoading(false));
      console.error('Remove cart item error:', e);
    }
  };

  const clearCart = async () => {
    dispatch(setCartLoading(true));
    try {
      await cartAPI.clear();
      dispatch(clearCartState());
    } catch (e) {
      dispatch(setCartLoading(false));
      console.error('Clear cart error:', e);
    }
  };

  const acceptBundle = async () => {
    dispatch(setCartLoading(true));
    try {
      await cartAPI.acceptBundle();
      await fetchCart();
    } catch (e) {
      dispatch(setCartLoading(false));
      console.error('Accept bundle error:', e);
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      subtotal,
      bundleSuggestion,
      loading,
      addToCart,
      updateItem,
      removeItem,
      clearCart,
      acceptBundle,
      fetchCart,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be inside CartProvider');
  return context;
};

