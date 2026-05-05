import api from './api';
import { mockSendMessage } from './mock/mockChat';

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
  const formData = new FormData();
  formData.append('messages', JSON.stringify(messages));
  formData.append('model', modelId);
  if (imageFile) formData.append('image', imageFile);

  try {
    const response = await api.post('/api/v1/chat', formData);
    const { role, content, diagnosis } = response.data;
    return { role, content, diagnosis: mapDiagnosis(diagnosis) };
  } catch {
    return mockSendMessage(messages, imageFile, modelId);
  }
}
