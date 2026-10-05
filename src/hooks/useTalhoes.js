import { useCallback, useEffect, useState } from "react";
import { listTalhoes } from "../services/talhoesService";
import {
  ACTIVE_TALHAO_EVENT,
  getActiveTalhao,
  setActiveTalhao,
} from "../services/activeTalhao";

/**
 * Talhões do usuário e o talhão ativo (TCC-093).
 *
 * Se o talhão ativo salvo não existe mais (foi apagado em outro aparelho),
 * volta para "Sem talhão" — senão o próximo laudo iria para um id morto.
 */
export default function useTalhoes() {
  const [talhoes, setTalhoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(getActiveTalhao);

  useEffect(() => {
    let alive = true;
    listTalhoes()
      .then((list) => {
        if (!alive) return;
        setTalhoes(list);
        const current = getActiveTalhao();
        if (current && !list.some((t) => t.id === current.id))
          setActiveTalhao(null);
      })
      .catch(() => {
        if (alive) setTalhoes([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const sync = () => setActive(getActiveTalhao());
    window.addEventListener(ACTIVE_TALHAO_EVENT, sync);
    return () => window.removeEventListener(ACTIVE_TALHAO_EVENT, sync);
  }, []);

  const choose = useCallback(
    (id) => {
      const talhao = talhoes.find((t) => t.id === id) || null;
      setActiveTalhao(talhao ? { id: talhao.id, nome: talhao.nome } : null);
    },
    [talhoes],
  );

  return { talhoes, loading, active, choose };
}
