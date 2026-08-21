import axios from 'axios';

// In production: VITE_API_URL = your backend Render URL (e.g. https://balancesheet-backend.onrender.com or https://balancesheet-backend.onrender.com/api)
// In development: falls back to /api (proxied by Vite to localhost:5000)
let rawBaseURL = import.meta.env.VITE_API_URL || '/api';
if (rawBaseURL.endsWith('/')) {
  rawBaseURL = rawBaseURL.slice(0, -1);
}
const baseURL = (rawBaseURL.startsWith('http') && !rawBaseURL.endsWith('/api'))
  ? `${rawBaseURL}/api`
  : rawBaseURL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
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

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
