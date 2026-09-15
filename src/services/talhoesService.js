import { IS_DEMO } from '../config/runtime';
import { v4 as uuidv4 } from 'uuid';
import api from './api';
import { getAuthHeaders, getCurrentUserId } from './authService';

/**
 * Serviço de Talhões.
 *
 * Em `AUTH_MODE === 'api'` (default) fala com o domínio `talhoes` do backend
 * (GET/POST/DELETE /api/v1/talhoes). Caso contrário (dev/mock), usa localStorage
 * com a mesma assinatura — a UI funciona idêntica nos dois modos.
 */

const storageKey = () => 'zepraga-talhoes:' + getCurrentUserId();

// ── camada local (mock/dev) ─────────────────────────────────────────────────
function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(storageKey())) || [];
  } catch {
    return [];
  }
}
function writeLocal(list) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(list));
  } catch {
    throw new Error("Falha ao salvar no armazenamento local.");
  }
}

// ── mapeamento API → shape da UI ─────────────────────────────────────────────
function mapTalhao(t) {
  return {
    id: t.id,
    nome: t.nome,
    apelido: t.apelido,
    hectares: t.hectares,
    cultura: t.cultura,
    dataSemeadura: t.data_semeadura ?? null,
    createdAt: t.created_at ?? null,
  };
}

export async function listTalhoes() {
  if (IS_DEMO) return readLocal();
  const response = await api.get('/api/v1/talhoes', { headers: getAuthHeaders() });
  return response.data.map(mapTalhao);
}

export async function createTalhao(data) {
  const payload = {
    nome: data.nome || 'Novo talhão',
    apelido: data.apelido || null,
    hectares: data.hectares === '' || data.hectares == null ? null : Number(data.hectares),
    cultura: data.cultura || 'soja',
    data_semeadura: data.dataSemeadura || null,
  };

  if (IS_DEMO) {
    const talhao = { id: uuidv4(), createdAt: new Date().toISOString(), ...data, ...payload, dataSemeadura: payload.data_semeadura };
    const list = readLocal();
    list.unshift(talhao);
    writeLocal(list);
    return talhao;
  }

  const response = await api.post('/api/v1/talhoes', payload, { headers: getAuthHeaders() });
  return mapTalhao(response.data);
}

export async function deleteTalhao(id) {
  if (IS_DEMO) {
    writeLocal(readLocal().filter((t) => t.id !== id));
    return;
  }
  await api.delete(`/api/v1/talhoes/${id}`, { headers: getAuthHeaders() });
}
