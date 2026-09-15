import { IS_DEMO } from '../config/runtime';
import api from './api';
import { mockAnalyzeImage } from './mock/mockInference';

const USE_MOCK = IS_DEMO;

function mapApiResponse(data) {
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

export async function analyzeImage(imageFile, modelId = 'ensemble') {
  if (USE_MOCK) {
    return mockAnalyzeImage(imageFile, modelId);
  }

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('model', modelId);

  const response = await api.post('/api/v1/inference', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const result = mapApiResponse(response.data);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quota-updated'));
  }

  return result;
}
