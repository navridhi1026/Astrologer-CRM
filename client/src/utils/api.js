import axios from 'axios';

// Auto-detect environment: use Render backend in production, localhost in dev
const BASE_URL = import.meta.env.VITE_API_URL
  || (window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : 'https://astrologer-crm-backend-ozzh.onrender.com/api');

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
