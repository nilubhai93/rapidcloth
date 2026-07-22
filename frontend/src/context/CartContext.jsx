import { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cartAPI, productAPI } from '../api';
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

const getGuestCart = () => {
  try {
    const raw = localStorage.getItem('guest_cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem('guest_cart', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save guest cart to localStorage:', e);
  }
};

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
      const guestItems = getGuestCart();
      const calcSubtotal = guestItems.reduce((sum, item) => {
        if (item.isRental && item.rentalDays > 0) {
          const rentPerDay = item.product?.rentPricePerDay || 0;
          return sum + rentPerDay * item.rentalDays * item.quantity;
        }
        const price = item.product?.discountPrice || item.product?.price || 0;
        return sum + price * item.quantity;
      }, 0);
      dispatch(setCartSuccess({
        items: guestItems,
        bundleSuggestion: null,
        subtotal: calcSubtotal,
      }));
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

  const addToCart = async (productId, size, color, quantity = 1, isRental = false, rentalDays = 0, productObj = null) => {
    dispatch(setCartLoading(true));
    try {
      if (!isAuthenticated) {
        const targetProductId = typeof productId === 'object' ? productId._id : productId;
        let fetchedProduct = productObj || (typeof productId === 'object' ? productId : null);
        if (!fetchedProduct) {
          try {
            const pRes = await productAPI.getById(targetProductId);
            fetchedProduct = pRes.data.product;
          } catch (err) {
            console.error('Could not fetch product for guest cart', err);
          }
        }
        const guestItems = getGuestCart();
        const existingIdx = guestItems.findIndex(
          i => (i.productId === targetProductId || i.product?._id === targetProductId) && i.size === size && i.isRental === !!isRental
        );

        if (existingIdx > -1) {
          guestItems[existingIdx].quantity += quantity;
          if (isRental) guestItems[existingIdx].rentalDays = rentalDays;
        } else {
          guestItems.push({
            _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            productId: targetProductId,
            product: fetchedProduct,
            size,
            color: color || '',
            quantity,
            isRental: !!isRental,
            rentalDays: rentalDays || 0
          });
        }
        saveGuestCart(guestItems);
        await fetchCart();
        dispatch(setCartLoading(false));
        return { message: 'Added to guest cart' };
      }

      const payload = { productId: typeof productId === 'object' ? productId._id : productId, size, color, quantity };
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
      if (!isAuthenticated) {
        let guestItems = getGuestCart();
        if (quantity <= 0) {
          guestItems = guestItems.filter(i => i._id !== itemId);
        } else {
          const item = guestItems.find(i => i._id === itemId);
          if (item) item.quantity = quantity;
        }
        saveGuestCart(guestItems);
        await fetchCart();
        dispatch(setCartLoading(false));
        return;
      }
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
      if (!isAuthenticated) {
        let guestItems = getGuestCart();
        guestItems = guestItems.filter(i => i._id !== itemId);
        saveGuestCart(guestItems);
        await fetchCart();
        dispatch(setCartLoading(false));
        return;
      }
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
      if (!isAuthenticated) {
        localStorage.removeItem('guest_cart');
        dispatch(clearCartState());
        dispatch(setCartLoading(false));
        return;
      }
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

  const mergeGuestCart = async () => {
    const guestItems = getGuestCart();
    if (!guestItems || guestItems.length === 0) return;
    try {
      dispatch(setCartLoading(true));
      await cartAPI.merge({ items: guestItems });
      localStorage.removeItem('guest_cart');
      await fetchCart();
    } catch (e) {
      console.error('Failed to merge guest cart:', e);
    } finally {
      dispatch(setCartLoading(false));
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
      mergeGuestCart,
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


