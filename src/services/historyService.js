import api from './api';
import { getAuthHeaders, getCurrentUserId } from './authService';
import * as mockHistory from './mock/mockHistory';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

const userId = () => getCurrentUserId();

function mapDiagnosis(data) {
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

export async function getDiagnoses() {
  if (USE_MOCK) return mockHistory.getAll(userId());

  const response = await api.get('/api/v1/diagnoses', { headers: getAuthHeaders() });
  return (response.data || []).map(mapDiagnosis);
}

export async function getDiagnosisById(id) {
  if (USE_MOCK) return mockHistory.getById(id, userId());

  const response = await api.get(`/api/v1/diagnoses/${id}`, { headers: getAuthHeaders() });
  return mapDiagnosis(response.data);
}

export async function saveDiagnosis(diagnosis) {
  if (USE_MOCK) return mockHistory.save(diagnosis, userId());

  // Backend persists diagnoses automatically when /inference or /chat is called.
  // This call is kept for legacy callers; nothing to persist server-side.
  return diagnosis;
}

export async function deleteDiagnosis(id) {
  if (USE_MOCK) return mockHistory.remove(id, userId());

  await api.delete(`/api/v1/diagnoses/${id}`, { headers: getAuthHeaders() });
  return { id };
}

export async function clearAllDiagnoses() {
  if (USE_MOCK) return mockHistory.clearAll(userId());

  await api.delete('/api/v1/diagnoses', { headers: getAuthHeaders() });
}
