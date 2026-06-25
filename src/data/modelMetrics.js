// ─────────────────────────────────────────────────────────────────────────────
// FONTE ÚNICA DE VERDADE — métricas dos modelos do Zé Praga.
//
// Números REAIS, avaliados no split de TESTE do dataset ASDID (n=1221, imagens
// não vistas no treino). Acurácia/F1 por modelo vêm de
// model-playground/artifacts/metrics/metrics_*.json; ensemble, latência e matriz
// de confusão foram medidos rodando os 3 ONNX no test set completo.
//
// NÃO inventar números aqui. Para atualizar, rode a avaliação no model-playground
// e cole os valores. Esta é a referência que as páginas (ModelsPage, ApiDocs,
// landing) consomem.
// ─────────────────────────────────────────────────────────────────────────────

export const DATASET = {
  name: 'ASDID',
  fullName: 'Annotated Soybean Disease Image Dataset',
  totalImages: 8130,
  classes: 6,
  split: { train: 5690, val: 1219, test: 1221, ratio: '70/15/15' },
  framework: 'PyTorch 2.x',
  resolution: '224×224 (380×380 p/ EfficientNet-B4)',
};

// Rótulos das 6 classes, na ordem do modelo (label_map.csv, alfabética).
export const CLASS_LABELS = [
  'Cercosporiose',
  'Ferrugem Asiática',
  'Mancha-Alvo',
  'Mancha Olho-de-rã',
  'Míldio',
  'Saudável',
];

// Comparação das 4 opções servidas pela API. accuracy/f1 ∈ [0,1].
// ensemble.accuracy/f1 e *.latencyMs são preenchidos a partir do eval no test set.
export const MODELS = [
  {
    id: 'ensemble',
    name: 'Ensemble',
    sub: 'ResNet-50 + EfficientNet-B4 + ViT-B/16 · média de probabilidades',
    accuracy: 0.991,
    f1: 0.9917,
    latencyMs: 1234,
    sizeMB: 485,
    prod: true,
  },
  {
    id: 'efficientnet_b4',
    name: 'EfficientNet-B4',
    sub: 'CNN · transfer learning ImageNet',
    accuracy: 0.9877,
    f1: 0.9882,
    latencyMs: 478,
    sizeMB: 67,
  },
  {
    id: 'vit_b16',
    name: 'ViT-B/16',
    sub: 'Vision Transformer · ImageNet',
    accuracy: 0.9803,
    f1: 0.9806,
    latencyMs: 393,
    sizeMB: 328,
  },
  {
    id: 'resnet50',
    name: 'ResNet-50',
    sub: 'CNN · transfer learning ImageNet',
    accuracy: 0.9599,
    f1: 0.9613,
    latencyMs: 363,
    sizeMB: 90,
  },
];

// Matriz de confusão do ensemble no test set — linha = classe real, coluna =
// predita, valores em % da linha (somam ~100). Ordem = labels abaixo.
// Ordem das linhas/colunas = ordem do modelo (alfabética por slug):
// cercosporiose, ferrugem, mancha-alvo, olho-de-rã, míldio, saudável.
export const CONFUSION_LABELS = ['Cercospor.', 'Ferrugem', 'Mancha-alvo', 'Olho-de-rã', 'Míldio', 'Saudável'];
export const CONFUSION_SHORT = ['Cerc.', 'Ferr.', 'M.alvo', 'Olho-rã', 'Míld.', 'Saud.'];
// Ensemble no test set (n=1221), % por linha (linha = real, coluna = predito).
export const CONFUSION_MATRIX = [
  [100, 0, 0, 0, 0, 0],
  [0, 99, 0, 0, 0, 0],
  [0, 1, 98, 1, 0, 1],
  [0, 0, 0, 100, 0, 0],
  [0, 0, 0, 0, 100, 0],
  [0, 0, 0, 1, 0, 99],
];

export const prodModel = MODELS.find((m) => m.prod);
