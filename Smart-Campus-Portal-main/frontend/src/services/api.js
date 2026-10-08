import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler for 401 Unauthorized and network failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && error.message === 'Network Error') {
      error.message = 'Unable to connect to the backend server. Please verify the backend is running on port 5000.';
    }

    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      const data = error.response.data || {};
      const isTokenExpiredOrInvalid =
        data.code === 'TOKEN_INVALID' ||
        data.code === 'TOKEN_EXPIRED' ||
        data.code === 'USER_NOT_FOUND' ||
        (typeof data.message === 'string' &&
          (data.message.toLowerCase().includes('expired') ||
           data.message.toLowerCase().includes('token is invalid') ||
           data.message.toLowerCase().includes('no longer exists')));

      if (!isAuthEndpoint && isTokenExpiredOrInvalid) {
        // Clear token only when session/token is truly expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login?error=' + encodeURIComponent('Your session has expired. Please sign in again.');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
