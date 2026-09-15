import { API_ORIGIN } from '../config/runtime';
import axios from 'axios';

const TOKEN_KEY = 'ze-praga-auth-token';
const USER_KEY = 'ze-praga-auth-user';
const EXPIRES_KEY = 'ze-praga-auth-expires-at';

const api = axios.create({
  baseURL: API_ORIGIN,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (typeof window !== 'undefined') {
      if (status === 401 && !error.config?.url?.includes('/auth/')) {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.removeItem(EXPIRES_KEY);
        window.dispatchEvent(new CustomEvent('auth-expired'));
      }

      if (status === 429 && !error.config?.url?.includes('/auth/')) {
        window.dispatchEvent(
          new CustomEvent('quota-exceeded', { detail: error.response?.data || null })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
