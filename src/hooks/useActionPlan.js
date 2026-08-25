import { useEffect, useState } from 'react';
import { getActionPlan } from '../services/actionPlanService';

/**
 * Carrega o plano de ação de uma doença sob demanda.
 *
 * Fica fora do payload do diagnóstico de propósito: o plano é o mesmo para
 * todos os diagnósticos de uma doença e nem sempre é aberto (no card do chat
 * ele só aparece quando o usuário expande), então buscá-lo separado evita
 * inflar cada resposta de chat e cada item do histórico.
 *
 * @param {string|null} diseaseId slug da doença; `null` não dispara a busca.
 * @param {boolean} enabled permite adiar a busca (ex.: só ao expandir o card).
 * @returns {{ actionPlan: object|null, loading: boolean, error: Error|null }}
 */
export function useActionPlan(diseaseId, enabled = true) {
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!diseaseId || !enabled) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getActionPlan(diseaseId)
      .then((plan) => {
        if (!cancelled) setActionPlan(plan);
      })
      .catch((err) => {
        // Plano indisponível não pode derrubar a tela de diagnóstico — o
        // diagnóstico em si é o conteúdo principal.
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [diseaseId, enabled]);

  return { actionPlan, loading, error };
}

export default useActionPlan;
