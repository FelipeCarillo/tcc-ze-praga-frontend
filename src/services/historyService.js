import api from "./api";
import { IS_DEMO } from "../config/runtime";
import { getAuthHeaders, getCurrentUserId } from "./authService";
import * as mockHistory from "./mock/mockHistory";

// Valor do filtro que seleciona os laudos sem talhão (espelha o backend).
export const SEM_TALHAO = "sem-talhao";
export function mapDiagnosis(data) {
  if (!data) return null;
  return {
    id: data.id,
    disease: data.disease_name ?? data.disease,
    diseaseId: data.disease_id ?? data.diseaseId,
    scientificName: data.scientific_name ?? data.scientificName,
    confidence: data.confidence,
    severity: data.severity,
    description: data.description,
    modelUsed: data.model_used ?? data.modelUsed,
    imageUrl: data.image_url ?? data.imageUrl,
    imageName: data.image_name ?? data.imageName,
    top3: (data.top3 || []).map((p) => ({
      disease: p.disease_name ?? p.disease,
      diseaseId: p.disease_id ?? p.diseaseId,
      scientificName: p.scientific_name ?? p.scientificName,
      confidence: p.confidence,
      severity: p.severity,
    })),
    timestamp: data.created_at ?? data.timestamp,
    // TCC-093: talhão onde a folha foi fotografada (null = sem talhão).
    talhaoId: data.talhao_id ?? data.talhaoId ?? null,
    talhaoNome: data.talhao_nome ?? data.talhaoNome ?? null,
  };
}
export async function getDiagnosesPage({
  page = 1,
  limit = 12,
  search = "",
  severity,
  talhaoId,
} = {}) {
  if (IS_DEMO) {
    let items = await mockHistory.getAll(getCurrentUserId());
    if (search)
      items = items.filter((d) =>
        (d.disease + " " + d.scientificName)
          .toLocaleLowerCase("pt-BR")
          .includes(search.toLocaleLowerCase("pt-BR")),
      );
    if (severity) items = items.filter((d) => d.severity === severity);
    if (talhaoId === SEM_TALHAO) items = items.filter((d) => !d.talhaoId);
    else if (talhaoId) items = items.filter((d) => d.talhaoId === talhaoId);
    return {
      items: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
    };
  }
  const { data } = await api.get("/api/v1/diagnoses", {
    headers: getAuthHeaders(),
    params: {
      page,
      limit,
      search: search || undefined,
      severity,
      talhao_id: talhaoId || undefined,
    },
  });
  return {
    items: (Array.isArray(data) ? data : data.items || []).map(mapDiagnosis),
    total: Array.isArray(data) ? data.length : data.total,
    page: data.page || page,
    limit: data.limit || limit,
  };
}
// Chamadores legados recebem a coleção completa; a tela principal usa páginas.
export async function getDiagnoses(filters = {}) {
  const first = await getDiagnosesPage({ ...filters, page: 1, limit: 100 });
  const items = [...first.items];
  for (let page = 2; items.length < first.total; page++) {
    const next = await getDiagnosesPage({ ...filters, page, limit: 100 });
    if (!next.items.length) break;
    items.push(...next.items);
  }
  return items;
}
export async function getDiagnosisById(id) {
  if (IS_DEMO) return mockHistory.getById(id, getCurrentUserId());
  const { data } = await api.get(
    "/api/v1/diagnoses/" + encodeURIComponent(id),
    { headers: getAuthHeaders() },
  );
  return mapDiagnosis(data);
}
function mapGroup(g) {
  return {
    talhaoId: g.talhao_id ?? null,
    talhaoNome: g.talhao_nome ?? null,
    fazendaId: g.fazenda_id ?? null,
    fazendaNome: g.fazenda_nome ?? null,
    total: g.total ?? 0,
    lastAt: g.last_at ?? null,
    severityTrend: g.severity_trend || [],
    recent: (g.recent || []).map(mapDiagnosis),
  };
}

/**
 * Histórico agrupado por talhão (TCC-093): um grupo por talhão do usuário,
 * inclusive os vazios, e por último "Sem talhão" quando houver laudos soltos.
 * Cada grupo traz o total, os `perGroup` laudos mais recentes e a tendência
 * de severidade do mais antigo para o mais recente.
 */
export async function getDiagnosesByTalhao({ perGroup = 3 } = {}) {
  if (IS_DEMO) {
    // Import tardio: só o modo demo precisa do armazenamento local.
    const { readFazendas, readTalhoes } = await import("./localFarmStore");
    const items = await mockHistory.getAll(getCurrentUserId());
    const talhoes = readTalhoes();
    const fazendaNome = new Map(readFazendas().map((f) => [f.id, f.nome]));
    const known = new Set(talhoes.map((t) => t.id));
    const byGroup = new Map();
    for (const d of items) {
      // Laudo de um talhão apagado volta para "Sem talhão", como o SET NULL.
      const gid = d.talhaoId && known.has(d.talhaoId) ? d.talhaoId : null;
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid).push(d);
    }
    const group = (id, nome, fazendaId = null) => {
      const list = byGroup.get(id) || [];
      const recent = list.slice(0, perGroup);
      return {
        talhaoId: id,
        talhaoNome: nome,
        fazendaId,
        fazendaNome: fazendaNome.get(fazendaId) ?? null,
        total: list.length,
        lastAt: list[0]?.timestamp ?? null,
        severityTrend: recent.map((d) => d.severity).reverse(),
        recent: recent.map((d) => ({ ...d, talhaoId: id, talhaoNome: nome })),
      };
    };
    const groups = talhoes
      .map((t) => group(t.id, t.nome, t.fazendaId))
      .sort(
        (a, b) =>
          (a.lastAt ? 0 : 1) - (b.lastAt ? 0 : 1) ||
          new Date(b.lastAt || 0) - new Date(a.lastAt || 0) ||
          (a.talhaoNome || "").localeCompare(b.talhaoNome || "", "pt-BR"),
      );
    if (byGroup.has(null)) groups.push(group(null, null));
    return groups;
  }
  const { data } = await api.get("/api/v1/diagnoses/por-talhao", {
    headers: getAuthHeaders(),
    params: { per_group: perGroup },
  });
  return (data || []).map(mapGroup);
}

/** Move um laudo para outro talhão (`talhao` null = "Sem talhão"). */
export async function setDiagnosisTalhao(id, talhao) {
  const talhaoId = talhao?.id ?? null;
  if (IS_DEMO) {
    const current = await mockHistory.getById(id, getCurrentUserId());
    if (!current) throw new Error("Registro não encontrado.");
    return mockHistory.save(
      { ...current, talhaoId, talhaoNome: talhao?.nome ?? null },
      getCurrentUserId(),
    );
  }
  const { data } = await api.patch(
    "/api/v1/diagnoses/" + encodeURIComponent(id) + "/talhao",
    { talhao_id: talhaoId },
    { headers: getAuthHeaders() },
  );
  return mapDiagnosis(data);
}

export async function saveDiagnosis(diagnosis) {
  if (IS_DEMO) return mockHistory.save(diagnosis, getCurrentUserId());
  return diagnosis;
}
export async function deleteDiagnosis(id) {
  if (IS_DEMO) return mockHistory.remove(id, getCurrentUserId());
  await api.delete("/api/v1/diagnoses/" + encodeURIComponent(id), {
    headers: getAuthHeaders(),
  });
  return { id };
}
export async function clearAllDiagnoses() {
  if (IS_DEMO) return mockHistory.clearAll(getCurrentUserId());
  const { data } = await api.delete("/api/v1/diagnoses", {
    headers: getAuthHeaders(),
    params: { confirm: true },
  });
  if (typeof data?.deleted !== "number")
    throw new Error("O servidor não confirmou a exclusão do histórico.");
  return data;
}
