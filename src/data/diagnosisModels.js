// ─────────────────────────────────────────────────────────────────────────────
// Modelos de diagnóstico oferecidos no chat e a regra de disponibilidade por
// plano. Espelha o backend: `PlanFeatures.diagnosis_models` guarda estes mesmos
// ids (vocabulário do chat) e `resolve_allowed_model()` em
// `app/domains/inference/service.py` aplica o gate do lado do servidor.
//
// O backend é a autoridade — ele rebaixa silenciosamente um pedido fora do
// plano para o melhor modelo permitido. Esta lista existe para a UI não
// *oferecer* o que o usuário não pode usar, evitando o caso em que ele escolhe
// Ensemble e recebe ResNet-50 sem saber.
// ─────────────────────────────────────────────────────────────────────────────

export const MODELS = [
  { id: 'ensemble', name: 'Ensemble', detail: 'Combina três modelos' },
  { id: 'efficientnet', name: 'EfficientNet-B4', detail: 'Modelo convolucional' },
  { id: 'vit', name: 'ViT-B/16', detail: 'Transformer' },
  { id: 'resnet50', name: 'ResNet-50', detail: 'Mais leve' },
];

// Ordem de preferência (melhor primeiro), pela acurácia no test set — a mesma
// de `_MODEL_PREFERENCE` no backend. Usada para escolher o default do seletor.
const PREFERENCE = ['ensemble', 'efficientnet', 'vit', 'resnet50'];

/**
 * Modelos que o plano libera.
 *
 * @param {object|null} features `PlanFeatures` de `useFeatures()`.
 * @returns {Set<string>} ids permitidos. Sem features, limita ao ResNet-50,
 *   espelhando o fallback gratuito do backend.
 */
export function allowedModelIds(features) {
  const list = features?.diagnosis_models;
  if (!Array.isArray(list) || list.length === 0) return new Set(['resnet50']);
  return new Set(list);
}

/**
 * Melhor modelo que o plano permite — o default do seletor.
 *
 * Sem isto o chat abriria sempre em "Ensemble", que só o Enterprise tem.
 *
 * @param {object|null} features `PlanFeatures` de `useFeatures()`.
 * @returns {string} id do modelo.
 */
export function defaultModelId(features) {
  const allowed = allowedModelIds(features);
  return PREFERENCE.find((id) => allowed.has(id)) || 'resnet50';
}

export default MODELS;
