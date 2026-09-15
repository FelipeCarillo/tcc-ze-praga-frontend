import { demoImagePreview } from './imagePreview';
import { v4 as uuidv4 } from 'uuid';
import { delay } from './delay';
import { diseases } from './mockData';

const modelDelays = {
  'resnet50': 1500,
  'efficientnet': 2000,
  'vit': 2500,
  'ensemble': 3500,
};

function generateTop3(primaryIndex) {
  const allDiseases = [...diseases];
  const primary = allDiseases[primaryIndex];
  const confidenceVariation = Math.random() * 0.06 - 0.03;
  const primaryConfidence = Math.min(0.99, Math.max(0.6, primary.confidence + confidenceVariation));

  const remaining = allDiseases.filter((_, i) => i !== primaryIndex);
  const shuffled = remaining.sort(() => Math.random() - 0.5);
  const remainingConfidence = 1 - primaryConfidence;
  const second = Math.random() * remainingConfidence * 0.7;
  const third = remainingConfidence - second;

  return [
    {
      disease: primary.name,
      diseaseId: primary.id,
      scientificName: primary.scientificName,
      confidence: parseFloat(primaryConfidence.toFixed(3)),
      severity: primary.severity,
      description: primary.description,
      actionPlan: primary.actionPlan,
    },
    {
      disease: shuffled[0].name,
      diseaseId: shuffled[0].id,
      scientificName: shuffled[0].scientificName,
      confidence: parseFloat(Math.max(0.01, second).toFixed(3)),
      severity: shuffled[0].severity,
    },
    {
      disease: shuffled[1].name,
      diseaseId: shuffled[1].id,
      scientificName: shuffled[1].scientificName,
      confidence: parseFloat(Math.max(0.005, third).toFixed(3)),
      severity: shuffled[1].severity,
    },
  ].sort((a, b) => b.confidence - a.confidence);
}

export async function mockAnalyzeImage(imageFile, modelId = 'ensemble') {
  const delayTime = modelDelays[modelId] || 2000;
  await delay(delayTime);

  const primaryIndex = Math.floor(Math.random() * diseases.length);
  const top3 = generateTop3(primaryIndex);
  const primary = top3[0];

  return {
    id: uuidv4(),
    disease: primary.disease,
    diseaseId: primary.diseaseId,
    scientificName: primary.scientificName,
    confidence: primary.confidence,
    severity: primary.severity,
    description: primary.description,
    actionPlan: primary.actionPlan,
    top3,
    modelUsed: modelId,
    imageUrl: await demoImagePreview(imageFile),
    imageName: imageFile.name,
    timestamp: new Date().toISOString(),
  };
}
