import { mockAnalyzeImage } from './mock/mockInference';

export async function analyzeImage(imageFile) {
  // Quando o backend real existir:
  // const formData = new FormData();
  // formData.append('image', imageFile);
  // const response = await api.post('/inference', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // });
  // return response.data;

  return mockAnalyzeImage(imageFile);
}
