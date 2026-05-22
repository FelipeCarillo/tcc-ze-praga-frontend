import api from './api';
import { mockSendMessage } from './mock/mockChat';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

function mapDiagnosis(data) {
  if (!data) return null;
  return {
    id: data.id,
    disease: data.disease_name,
    diseaseId: data.disease_id,
    scientificName: data.scientific_name,
    confidence: data.confidence,
    severity: data.severity,
    description: data.description,
    modelUsed: data.model_used,
    imageUrl: data.image_url,
    imageName: data.image_name,
    top3: (data.top3 || []).map((p) => ({
      disease: p.disease_name,
      diseaseId: p.disease_id,
      scientificName: p.scientific_name,
      confidence: p.confidence,
      severity: p.severity,
    })),
    timestamp: data.created_at,
  };
}

export async function sendMessage(messages, imageFile = null, modelId = 'ensemble') {
  if (USE_MOCK) {
    return mockSendMessage(messages, imageFile, modelId);
  }

  const formData = new FormData();
  formData.append('messages', JSON.stringify(messages));
  formData.append('model', modelId);
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post('/api/v1/chat', formData);
  const { role, content, diagnosis } = response.data;
  const result = { role, content, diagnosis: mapDiagnosis(diagnosis) };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quota-updated'));
  }

  return result;
}
