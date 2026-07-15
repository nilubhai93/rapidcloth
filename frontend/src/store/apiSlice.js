import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from state or local storage
      const state = getState();
      const token = state.auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category', 'Order', 'SellerSettings', 'UserProfile'],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map(({ _id }) => ({ type: 'Product', id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep in cache for 5 minutes
    }),
    getProductDetails: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
      keepUnusedDataFor: 300,
    }),
    getCategories: builder.query({
      query: () => '/products/categories',
      providesTags: ['Category'],
      keepUnusedDataFor: 600, // Categories change rarely, keep for 10 mins
    }),
    getFeaturedProducts: builder.query({
      query: () => '/products/featured',
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
      keepUnusedDataFor: 300,
    }),
    getDeals: builder.query({
      query: () => '/products/deals',
      providesTags: [{ type: 'Product', id: 'DEALS' }],
      keepUnusedDataFor: 300,
    }),
    // Orders
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Order', id: _id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getOrderDetails: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    // Seller Settings
    getSellerSettings: builder.query({
      query: () => '/seller/dashboard/settings',
      providesTags: ['SellerSettings'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetDealsQuery,
  useGetOrdersQuery,
  useGetOrderDetailsQuery,
  useGetSellerSettingsQuery,
} = apiSlice;
