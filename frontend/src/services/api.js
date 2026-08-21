import axios from 'axios';

// Sanitize and normalize API Base URL
let rawBaseURL = (import.meta.env.VITE_API_URL || '/api').trim();
rawBaseURL = rawBaseURL.replace(/\/+$/, ''); // remove trailing slashes
if (rawBaseURL.endsWith('/api')) {
  rawBaseURL = rawBaseURL.slice(0, -4);
}
rawBaseURL = rawBaseURL.replace(/\/+$/, '');

const baseURL = rawBaseURL.startsWith('http') ? `${rawBaseURL}/api` : '/api';

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
