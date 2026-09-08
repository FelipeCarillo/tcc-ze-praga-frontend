import { IS_DEMO } from '../config/runtime';
import api from './api';
import { getAuthHeaders, getCurrentUser } from './authService';
import { diseases as mockDiseases } from './mock/mockData';

const USE_MOCK = IS_DEMO;

/**
 * Converte a resposta do backend para o formato que o componente `ActionPlan`
 * consome — um objeto com uma chave por nível mais `sources`.
 *
 * Backend: `{ disease_id, levels: [{ level, actions }], sources: [...],
 *             allowed_levels: [...] }`
 * Componente: `{ essencial: [...], campo: [...], sources: [...] }`
 *
 * O backend já filtra `levels` pelo plano do usuário; `allowedLevels` vem junto
 * para a UI conseguir mostrar o que está bloqueado como upsell, em vez de
 * simplesmente esconder.
 */
function mapActionPlan(data) {
  if (!data) return null;
  const plan = { sources: data.sources || [] };
  (data.levels || []).forEach((lvl) => {
    plan[lvl.level] = lvl.actions || [];
  });
  plan.allowedLevels = data.allowed_levels || Object.keys(plan);
  return plan;
}

/**
 * Busca o plano de ação de uma doença.
 *
 * Devolve `null` quando a doença não tem plano cadastrado (404) — é um estado
 * legítimo, não um erro: a UI simplesmente não renderiza a seção.
 *
 * @param {string} diseaseId slug da doença (ex: "ferrugem-asiatica")
 * @returns {Promise<object|null>}
 */
export async function getActionPlan(diseaseId) {
  if (!diseaseId) return null;

  if (USE_MOCK) {
    const found = mockDiseases.find((d) => d.id === diseaseId);
    const source = found?.actionPlan;
    if (!source) return null;
    const levels = getCurrentUser()?.plan?.features?.action_plan_levels || ['essencial'];
    if (Array.isArray(source)) return source;
    return Object.fromEntries(Object.entries(source).filter(([key])=>key === 'sources' || levels.includes(key)));
  }

  try {
    const response = await api.get(`/api/v1/action-plans/${diseaseId}`, {
      headers: getAuthHeaders(),
    });
    return mapActionPlan(response.data);
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export default getActionPlan;
