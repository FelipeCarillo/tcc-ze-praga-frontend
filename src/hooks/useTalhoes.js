import { useCallback, useEffect, useState } from "react";
import { listFazendas } from "../services/fazendasService";
import { setActiveFazendaId } from "../services/activeFazenda";
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
 *
 * TCC-096: os talhões vêm das fazendas, cada um com `fazendaNome`, para o
 * seletor agrupar por fazenda. Escolher um talhão torna a fazenda dele ativa.
 */
export default function useTalhoes() {
  const [talhoes, setTalhoes] = useState([]);
  const [fazendas, setFazendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(getActiveTalhao);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    listFazendas()
      .then((farms) => {
        if (!alive) return;
        const list = farms.flatMap((f) =>
          f.talhoes.map((t) => ({ ...t, fazendaId: f.id, fazendaNome: f.nome })),
        );
        setFazendas(farms);
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
  }, [version]);

  useEffect(() => {
    // Talhão novo (criado pelo Zé na conversa) vira o ativo antes de estar
    // na lista: recarrega para o seletor mostrá-lo.
    const sync = () => {
      setActive(getActiveTalhao());
      setVersion((v) => v + 1);
    };
    window.addEventListener(ACTIVE_TALHAO_EVENT, sync);
    return () => window.removeEventListener(ACTIVE_TALHAO_EVENT, sync);
  }, []);

  const choose = useCallback(
    (id) => {
      const talhao = talhoes.find((t) => t.id === id) || null;
      setActiveTalhao(talhao ? { id: talhao.id, nome: talhao.nome } : null);
      if (talhao?.fazendaId) setActiveFazendaId(talhao.fazendaId);
    },
    [talhoes],
  );

  return { talhoes, fazendas, loading, active, choose };
}
