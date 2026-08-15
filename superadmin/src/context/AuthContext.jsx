import React, { createContext, useContext, useState, useEffect } from 'react';
import { superAdminApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('superadmin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('superadmin_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.login(email, password);
      const { token: userToken, user: userData } = response.data;

      if (userData.role !== 'superadmin') {
        throw new Error('Access denied. Superadmin account required.');
      }

      setToken(userToken);
      setUser(userData);

      localStorage.setItem('superadmin_token', userToken);
      localStorage.setItem('superadmin_user', JSON.stringify(userData));

      setLoading(false);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Login failed';
      setError(errMsg);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
