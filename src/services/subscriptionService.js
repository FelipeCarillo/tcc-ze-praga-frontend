import { IS_DEMO } from '../config/runtime';
import api from './api';
import { getAuthHeaders, getCurrentUser, getCurrentUserId } from './authService';
import * as mockSubscriptions from './mock/mockSubscriptions';



export const PLAN_DETAILS = mockSubscriptions.PLAN_DETAILS;
export const usageFromPlan = mockSubscriptions.usageFromPlan;

function throwApiError(message) {
  throw new Error(message);
}

export async function listPlans() {
  if (IS_DEMO) return mockSubscriptions.listPlans();

  try {
    const response = await api.get('/api/v1/subscriptions/plans');
    return response.data;
  } catch {
    return throwApiError('Não foi possível carregar os planos de assinatura.');
  }
}

export async function getMySubscription() {
  if (IS_DEMO) return getCurrentUser()?.subscription || null;

  try {
    const response = await api.get('/api/v1/subscriptions/me', { headers: getAuthHeaders() });
    return response.data;
  } catch {
    return throwApiError('Não foi possível carregar sua assinatura.');
  }
}

export async function subscribeToPlan(planName) {
  if (IS_DEMO) {
    return mockSubscriptions.subscribe(getCurrentUserId(), planName);
  }

  try {
    const response = await api.post(
      '/api/v1/subscriptions/me',
      { plan_name: planName },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch {
    return throwApiError('Não foi possível ativar a assinatura.');
  }
}
