import api from './api';
import { getAuthHeaders } from './authService';

/**
 * Fetches the current user's daily usage summary.
 *
 * Returns: { chat: {used, limit, remaining}, inference: {...}, api: {...} }
 */
export async function getUsageSummary() {
  const response = await api.get('/api/v1/usage/me', { headers: getAuthHeaders() });
  return response.data;
}
