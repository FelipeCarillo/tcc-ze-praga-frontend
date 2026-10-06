import { IS_DEMO } from '../config/runtime';
import api from './api';
import { getAuthHeaders } from './authService';
import { createLocalTalhao, readTalhoes, writeTalhoes } from './localFarmStore';

/**
 * Serviço de Talhões.
 *
 * Em `AUTH_MODE === 'api'` (default) fala com o domínio `talhoes` do backend
 * (GET/POST/PATCH/DELETE /api/v1/talhoes). Caso contrário (dev/mock), usa
 * localStorage com a mesma assinatura — a UI funciona idêntica nos dois modos.
 *
 * TCC-096: todo talhão pertence a uma fazenda (`fazendaId`). Sem fazenda
 * escolhida, o backend usa a fazenda padrão do usuário.
 */

// ── mapeamento API → shape da UI ─────────────────────────────────────────────
export function mapTalhao(t) {
  return {
    id: t.id,
    fazendaId: t.fazenda_id ?? null,
    nome: t.nome,
    apelido: t.apelido,
    hectares: t.hectares,
    cultura: t.cultura,
    dataSemeadura: t.data_semeadura ?? null,
    createdAt: t.created_at ?? null,
  };
}

function toNumber(value) {
  return value === '' || value == null ? null : Number(value);
}

export async function listTalhoes({ fazendaId } = {}) {
  if (IS_DEMO) {
    const list = readTalhoes();
    return fazendaId ? list.filter((t) => t.fazendaId === fazendaId) : list;
  }
  const response = await api.get('/api/v1/talhoes', {
    headers: getAuthHeaders(),
    params: fazendaId ? { fazenda_id: fazendaId } : undefined,
  });
  return response.data.map(mapTalhao);
}

export async function createTalhao(data) {
  const payload = {
    nome: data.nome || 'Novo talhão',
    apelido: data.apelido || null,
    hectares: toNumber(data.hectares),
    cultura: data.cultura || 'soja',
    data_semeadura: data.dataSemeadura || null,
    fazenda_id: data.fazendaId || null,
  };

  if (IS_DEMO) return createLocalTalhao({ ...data, ...payload, fazendaId: payload.fazenda_id, dataSemeadura: payload.data_semeadura });

  const response = await api.post('/api/v1/talhoes', payload, { headers: getAuthHeaders() });
  return mapTalhao(response.data);
}

/** Edita o talhão; `fazendaId` move para outra fazenda do usuário. */
export async function updateTalhao(id, data) {
  const payload = {};
  if ('nome' in data) payload.nome = data.nome;
  if ('apelido' in data) payload.apelido = data.apelido || null;
  if ('hectares' in data) payload.hectares = toNumber(data.hectares);
  if ('dataSemeadura' in data) payload.data_semeadura = data.dataSemeadura || null;
  if ('fazendaId' in data) payload.fazenda_id = data.fazendaId;

  if (IS_DEMO) {
    let updated = null;
    writeTalhoes(
      readTalhoes().map((t) => {
        if (t.id !== id) return t;
        updated = {
          ...t,
          ...('nome' in payload && { nome: payload.nome }),
          ...('apelido' in payload && { apelido: payload.apelido }),
          ...('hectares' in payload && { hectares: payload.hectares }),
          ...('data_semeadura' in payload && { dataSemeadura: payload.data_semeadura }),
          ...('fazenda_id' in payload && { fazendaId: payload.fazenda_id }),
        };
        return updated;
      }),
    );
    if (!updated) throw new Error('Talhão não encontrado.');
    return updated;
  }

  const response = await api.patch(`/api/v1/talhoes/${id}`, payload, { headers: getAuthHeaders() });
  return mapTalhao(response.data);
}

export async function deleteTalhao(id) {
  if (IS_DEMO) {
    writeTalhoes(readTalhoes().filter((t) => t.id !== id));
    return;
  }
  await api.delete(`/api/v1/talhoes/${id}`, { headers: getAuthHeaders() });
}
