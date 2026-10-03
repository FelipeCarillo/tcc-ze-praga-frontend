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

// Modelos que o deploy carrega (`INFERENCE_MODELS` no backend), no vocabulário
// do chat. Vazio = todos. Na nuvem enxuta só o EfficientNet-B4 sobe
// (REACT_APP_DIAGNOSIS_MODELS=efficientnet): oferecer ResNet ou Ensemble
// mostraria uma escolha que o servidor não tem como cumprir.
export const DEPLOYED_MODELS = (process.env.REACT_APP_DIAGNOSIS_MODELS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

/**
 * Modelos que o plano libera, limitados aos que o deploy carrega.
 *
 * @param {object|null} features `PlanFeatures` de `useFeatures()`.
 * @param {string[]} deployed modelos carregados no servidor (vazio = todos).
 * @returns {Set<string>} ids permitidos. Sem features, limita ao ResNet-50,
 *   espelhando o fallback gratuito do backend. Se o plano não cobre nenhum
 *   modelo carregado, vale o do deploy — é o que o servidor roda de fato.
 */
export function allowedModelIds(features, deployed = DEPLOYED_MODELS) {
  const list = features?.diagnosis_models;
  const plan =
    !Array.isArray(list) || list.length === 0 ? ['resnet50'] : list;
  if (!deployed.length) return new Set(plan);
  const both = plan.filter((id) => deployed.includes(id));
  return new Set(both.length ? both : deployed);
}

/**
 * Melhor modelo que o plano permite — o default do seletor.
 *
 * Sem isto o chat abriria sempre em "Ensemble", que só o Enterprise tem.
 *
 * @param {object|null} features `PlanFeatures` de `useFeatures()`.
 * @returns {string} id do modelo.
 */
export function defaultModelId(features, deployed = DEPLOYED_MODELS) {
  const allowed = allowedModelIds(features, deployed);
  return PREFERENCE.find((id) => allowed.has(id)) || [...allowed][0] || 'resnet50';
}

export default MODELS;
