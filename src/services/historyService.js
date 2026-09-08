import api from "./api";
import { IS_DEMO } from "../config/runtime";
import { getAuthHeaders, getCurrentUserId } from "./authService";
import * as mockHistory from "./mock/mockHistory";
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
  };
}
export async function getDiagnosesPage({
  page = 1,
  limit = 12,
  search = "",
  severity,
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
    return {
      items: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
    };
  }
  const { data } = await api.get("/api/v1/diagnoses", {
    headers: getAuthHeaders(),
    params: { page, limit, search: search || undefined, severity },
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
