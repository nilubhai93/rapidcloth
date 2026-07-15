import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from '../api';
import {
  authStart,
  authSuccess,
  authFailed,
  updateProfileSuccess,
  logoutSuccess,
  setLoading,
  selectUser,
  selectToken,
  selectAuthLoading,
  selectIsAuthenticated,
} from '../store/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logoutSuccess());
  };

  useEffect(() => {
    if (token) {
      dispatch(authStart());
      authAPI.getProfile()
        .then(res => {
          dispatch(authSuccess({ user: res.data.user }));
          localStorage.setItem('user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        });
    } else {
      dispatch(setLoading(false));
    }
  }, [token, dispatch]);

  const login = async (email, password) => {
    dispatch(authStart());
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
      return res.data;
    } catch (e) {
      dispatch(authFailed());
      throw e;
    }
  };

  const register = async (name, email, password, role = 'user', extraData = {}) => {
    dispatch(authStart());
    try {
      const res = await authAPI.register(name, email, password, role, extraData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
      return res.data;
    } catch (e) {
      dispatch(authFailed());
      throw e;
    }
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    dispatch(updateProfileSuccess(res.data.user));
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  };

  const sendOtp = async (email) => {
    return await authAPI.sendOtp(email);
  };

  const verifyOtp = async (email, otp) => {
    dispatch(authStart());
    try {
      const res = await authAPI.verifyOtp(email, otp);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
      return res.data;
    } catch (e) {
      dispatch(authFailed());
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser: (u) => dispatch(updateProfileSuccess(u)),
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      sendOtp,
      verifyOtp,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
};

