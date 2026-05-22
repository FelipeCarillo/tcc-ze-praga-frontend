import React from 'react';
import { useFeatures } from '../contexts/FeaturesContext';

/**
 * FeatureGate — renderiza ``children`` so' quando a feature do plano esta
 * ativa (TCC-052).
 *
 * Props:
 * - feature: nome da feature (chave em PlanFeatures, ex: "api_access",
 *   "export_diagnoses", "multi_account").
 * - children: conteudo renderizado quando a feature esta ativa.
 * - fallback: opcional. Renderizado quando a feature esta desativada.
 *   Default: ``null`` (nao renderiza nada).
 *
 * Edge cases:
 * - usuario deslogado / sem subscription -> ``features`` eh null -> fallback
 * - features ativas eh um boolean truthy/falsy no PlanFeatures
 * - listas (ex: action_plan_levels) NAO sao gated por este componente —
 *   FeatureGate so' faz checks booleanos. Pra listas, leia ``useFeatures``
 *   direto e use ``.includes(...)``.
 *
 * Uso:
 *   <FeatureGate feature="api_access">
 *     <Button>Gerenciar API Keys</Button>
 *   </FeatureGate>
 *
 *   <FeatureGate
 *     feature="export_diagnoses"
 *     fallback={<UpgradePrompt feature="export" />}
 *   >
 *     <ExportButton />
 *   </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback = null }) {
  const features = useFeatures();
  if (!features) {
    return fallback;
  }
  const value = features[feature];
  // Trata como ativada SOMENTE quando o valor eh literalmente boolean true.
  // Strings/numbers/listas nao contam (use useFeatures direto pra isso).
  if (value !== true) {
    return fallback;
  }
  return children;
}

export default FeatureGate;
