// src/lib/apiClient.js
import axios from 'axios';

// In Vite, use import.meta.env (process.env is not defined in browser)
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  || (typeof window !== 'undefined' && window.__API_URL__)
  || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// attach token automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
}, err => Promise.reject(err));

// simple response error handler (expand as needed)
api.interceptors.response.use(r => r, err => {
  if (err.response && err.response.status === 401) {
    // optional: force logout globally
    // localStorage.removeItem('token');
    // window.location.href = '/login';
  }
  return Promise.reject(err);
});

export default api;
