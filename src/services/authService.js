import api from './api';

const TOKEN_KEY = 'ze-praga-auth-token';
const USER_KEY = 'ze-praga-auth-user';
const EXPIRES_KEY = 'ze-praga-auth-expires-at';
const AUTH_MODE = process.env.REACT_APP_AUTH_MODE || 'mock';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const mockUser = {
  id: 'mock-user-1',
  email: '',
  full_name: 'Produtor',
  created_at: new Date().toISOString(),
  subscription: null,
  usage: {
    chat: { used: 2, limit: 10 },
    inference: { used: 1, limit: 5 },
    api: { used: 0, limit: 0 },
  },
};

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + SESSION_TTL_MS));
  return { token, user };
}

function createMockUser(values) {
  const profile = { ...values };
  delete profile.password;
  const email = profile.email.trim().toLowerCase();
  return {
    ...mockUser,
    ...profile,
    email,
    id: `local-user-${email.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
  };
}

function readUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function apiHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAuthHeaders() {
  return apiHeaders();
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  return readUser();
}

export function getCurrentUserId() {
  return readUser()?.id || 'guest';
}

export function saveCurrentUser(user) {
  return saveSession(getAuthToken(), user);
}

export async function getSession() {
  const token = getAuthToken();
  const user = readUser();
  if (!token || !user) return null;
  if (Number(localStorage.getItem(EXPIRES_KEY) || 0) < Date.now()) {
    logout();
    return null;
  }

  if (AUTH_MODE !== 'api') return { token, user };

  const response = await api.get('/api/v1/users/me', { headers: apiHeaders() });
  return saveSession(token, { ...user, ...response.data });
}

export async function login({ email, password }) {
  if (AUTH_MODE !== 'api') {
    return saveSession(`mock-token-${Date.now()}`, createMockUser({ email }));
  }

  const response = await api.post('/api/v1/auth/login', { email, password });
  return saveSession(response.data.access_token, response.data.user);
}

export async function register({ full_name, email, password }) {
  if (AUTH_MODE !== 'api') {
    return saveSession(`mock-token-${Date.now()}`, createMockUser({ full_name, email }));
  }

  const response = await api.post('/api/v1/auth/register', { full_name, email, password });
  return saveSession(response.data.access_token, response.data.user);
}

export async function updateProfile(values) {
  if (AUTH_MODE !== 'api') {
    return saveSession(getAuthToken(), { ...readUser(), ...values });
  }

  const response = await api.patch('/api/v1/users/me', values, { headers: apiHeaders() });
  return saveSession(getAuthToken(), { ...readUser(), ...response.data });
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}
