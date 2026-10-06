import { useCallback, useEffect, useState } from "react";
import { listFazendas } from "../services/fazendasService";
import { getDiagnosesByTalhao } from "../services/historyService";
import {
  ACTIVE_FAZENDA_EVENT,
  getActiveFazendaId,
  pickActive,
  setActiveFazendaId,
} from "../services/activeFazenda";
import { riskOf } from "../utils/severity";

/**
 * Fazendas com os talhões aninhados e a situação de cada talhão (TCC-096).
 *
 * Junta `GET /fazendas` (a hierarquia) com o histórico por talhão (o último
 * laudo e a tendência). Se o histórico falhar, as fazendas aparecem mesmo
 * assim, só sem a cor de risco.
 */
export function summarize(fazenda) {
  const talhoes = fazenda.talhoes || [];
  const areaTalhoes = talhoes.reduce((sum, t) => sum + (Number(t.hectares) || 0), 0);
  return {
    talhoes: talhoes.length,
    hectares: areaTalhoes || Number(fazenda.hectares) || 0,
    altoRisco: talhoes.filter((t) => riskOf(t.last?.severity).rank === 3).length,
    laudos: talhoes.reduce((sum, t) => sum + (t.total || 0), 0),
  };
}

export default function useFazendas() {
  const [fazendas, setFazendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [activeId, setActiveId] = useState(getActiveFazendaId);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    Promise.all([listFazendas(), getDiagnosesByTalhao({ perGroup: 3 }).catch(() => [])])
      .then(([list, groups]) => {
        if (!alive) return;
        const byTalhao = new Map(groups.filter((g) => g.talhaoId).map((g) => [g.talhaoId, g]));
        setFazendas(
          list.map((f) => ({
            ...f,
            talhoes: f.talhoes.map((t) => {
              const g = byTalhao.get(t.id);
              return {
                ...t,
                total: g?.total ?? 0,
                last: g?.recent?.[0] ?? null,
                trend: g?.severityTrend ?? [],
              };
            }),
          })),
        );
      })
      .catch(() => alive && setError("Não foi possível carregar suas fazendas."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [version]);

  useEffect(() => {
    const sync = () => setActiveId(getActiveFazendaId());
    window.addEventListener(ACTIVE_FAZENDA_EVENT, sync);
    return () => window.removeEventListener(ACTIVE_FAZENDA_EVENT, sync);
  }, []);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const choose = useCallback((id) => setActiveFazendaId(id), []);

  return {
    fazendas,
    loading,
    error,
    reload,
    active: pickActive(fazendas, activeId),
    choose,
  };
}
