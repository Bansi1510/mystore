import axios from 'axios';

export function getApiBaseUrl() {
  let url = import.meta.env.VITE_API_URL || '/api';
  if (typeof url === 'string') {
    url = url.trim();
    if (!url) return '/api';
    url = url.replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url += '/api';
    }
  }
  return url;
}

const API_BASE = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000, // 30s timeout for Render free tier cold-start wake ups
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
