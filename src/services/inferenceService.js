import api from './api';
import { mockAnalyzeImage } from './mock/mockInference';

export async function analyzeImage(imageFile, modelId = 'ensemble') {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('model', modelId);

  try {
    const response = await api.post('/api/v1/inference', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch {
    return mockAnalyzeImage(imageFile, modelId);
  }
}
