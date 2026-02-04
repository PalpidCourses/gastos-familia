import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (email, password, tenantSlug) =>
    api.post('/auth/login', { email, password, tenantSlug }),
  register: (email, password, tenantId) =>
    api.post('/auth/register', { email, password, tenantId }),
};

// Expenses
export const expensesAPI = {
  list: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  get: (id) => api.get(`/expenses/${id}`),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Categories
export const categoriesAPI = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Family Members
export const familyMembersAPI = {
  list: () => api.get('/family-members'),
  create: (data) => api.post('/family-members', data),
  update: (id, data) => api.put(`/family-members/${id}`, data),
  delete: (id) => api.delete(`/family-members/${id}`),
};
