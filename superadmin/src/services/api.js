import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('superadmin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('superadmin_token');
      localStorage.removeItem('superadmin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Superadmin Services
export const superAdminApi = {
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/me'),

  // Analytics
  getAnalytics: () => api.get('/superadmin/analytics/zone-overview'),

  // Zones
  getZones: () => api.get('/superadmin/zones'),
  getZoneById: (id) => api.get(`/superadmin/zones/${id}`),
  createZone: (data) => api.post('/superadmin/zones', data),
  updateZone: (id, data) => api.put(`/superadmin/zones/${id}`, data),
  deleteZone: (id) => api.delete(`/superadmin/zones/${id}`),

  // Admins
  getAdmins: () => api.get('/superadmin/admins'),
  createAdmin: (data) => api.post('/superadmin/admins', data),
  updateAdmin: (id, data) => api.put(`/superadmin/admins/${id}`, data),

  // Entity Directories
  getSellers: (params) => api.get('/superadmin/sellers', { params }),
  createSeller: (data) => api.post('/superadmin/sellers', data),
  approveSeller: (sellerId, data) => api.put(`/superadmin/sellers/approve/${sellerId}`, data),
  getDeliveryPartners: (params) => api.get('/superadmin/delivery-partners', { params }),
  createDeliveryPartner: (data) => api.post('/superadmin/delivery-partners', data),
  getCustomers: (params) => api.get('/superadmin/customers', { params })
};

export default api;
