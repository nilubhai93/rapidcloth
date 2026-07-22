import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
let user = null;
try {
  const cachedUser = localStorage.getItem('user');
  if (cachedUser) {
    user = JSON.parse(cachedUser);
  }
} catch (e) {
  console.error('Failed to parse cached user', e);
}

const initialState = {
  user,
  token,
  loading: !!token, // Start with loading true if we have a token, as we need to verify it with profile API
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
    },
    authSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
      state.loading = false;
    },
    authFailed: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    updateProfileSuccess: (state, action) => {
      state.user = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailed,
  updateProfileSuccess,
  logoutSuccess,
  setLoading,
} = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectUserRole = (state) => state.auth.user?.role || null;
export const selectUserPermissions = (state) => state.auth.user?.permissions || [];

export default authSlice.reducer;
