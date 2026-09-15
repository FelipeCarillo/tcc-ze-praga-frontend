import { IS_DEMO } from '../config/runtime';
import api from './api';
import { getAuthHeaders, getCurrentUser } from './authService';

/**
 * Fetches the current user's daily usage summary.
 *
 * Returns: { chat: {used, limit, remaining}, inference: {...}, api: {...} }
 */
export async function getUsageSummary() {
  if (IS_DEMO) return getCurrentUser()?.usage || {};
  const response = await api.get('/api/v1/usage/me', { headers: getAuthHeaders() });
  return response.data;
}
