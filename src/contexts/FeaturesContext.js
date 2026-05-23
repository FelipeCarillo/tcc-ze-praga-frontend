import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * FeaturesContext — expoe ``plan.features`` do usuario autenticado (TCC-052).
 *
 * O backend ``/api/v1/users/me`` (depois do TCC-049) retorna o user com
 * ``plan: { ..., features: {...} }``. Este contexto serve esse dict pra
 * componentes via hook ``useFeatures()``. Quando o usuario nao tem
 * subscription ativa ou esta deslogado, retorna ``null``.
 *
 * Uso:
 *   const features = useFeatures();
 *   if (features?.api_access) { ... }
 *
 * Ou via FeatureGate component:
 *   <FeatureGate feature="api_access"><LinkApiDocs /></FeatureGate>
 */
export const FeaturesContext = createContext(null);

export function FeaturesProvider({ children }) {
  const { user } = useAuth();
  const features = useMemo(() => user?.plan?.features ?? null, [user]);
  return (
    <FeaturesContext.Provider value={features}>{children}</FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}

/**
 * Retorna o tier_name do plano ativo do usuario (free/pro/enterprise) ou
 * ``null`` quando nao ha plano.
 */
export function useTier() {
  const features = useFeatures();
  return features?.tier_name ?? null;
}
