import { v4 as uuidv4 } from 'uuid';
import { delay } from './delay';
import { diseases } from './mockData';

export async function mockAnalyzeImage(imageFile) {
  await delay(2000);

  const disease = diseases[Math.floor(Math.random() * diseases.length)];
  const confidenceVariation = Math.random() * 0.06 - 0.03;
  const confidence = Math.min(0.99, Math.max(0.5, disease.confidence + confidenceVariation));

  return {
    id: uuidv4(),
    disease: disease.name,
    diseaseId: disease.id,
    scientificName: disease.scientificName,
    confidence: parseFloat(confidence.toFixed(2)),
    severity: disease.severity,
    description: disease.description,
    actionPlan: disease.actionPlan,
    imageUrl: URL.createObjectURL(imageFile),
    imageName: imageFile.name,
    timestamp: new Date().toISOString(),
  };
}
