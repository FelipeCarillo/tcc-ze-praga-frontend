import api from './api';
import { mockAnalyzeImage } from './mock/mockInference';

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
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('model', modelId);

  try {
    const response = await api.post('/api/v1/inference', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapApiResponse(response.data);
  } catch {
    return mockAnalyzeImage(imageFile, modelId);
  }
}
