import { useCallback, useEffect, useMemo, useState } from "react";
import { useFeatures } from "../contexts/FeaturesContext";
import {
  MODELS,
  allowedModelIds,
  defaultModelId,
} from "../data/diagnosisModels";
import { getCurrentUserId } from "../services/authService";

/**
 * Modelo de análise preferido (rebrand 2026).
 *
 * No canvas o seletor sai do composer do chat e vira "Modelo de análise" no
 * Perfil (m-Perfil) e no cabeçalho da conversa no desktop (d-Chat). Os três
 * leem e gravam aqui. A escolha fica por usuário no aparelho e é sempre
 * filtrada pelo plano: se o plano mudar e o modelo salvo sair dele, volta ao
 * melhor permitido — o backend também aplica esse gate.
 */
const EVENT = "preferred-model-changed";
const key = () => "zepraga-modelo:" + getCurrentUserId();

function read() {
  try {
    return localStorage.getItem(key()) || null;
  } catch {
    return null;
  }
}

export default function usePreferredModel() {
  const features = useFeatures();
  const allowed = useMemo(() => allowedModelIds(features), [features]);
  const [stored, setStored] = useState(read);

  useEffect(() => {
    const sync = () => setStored(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const options = useMemo(
    () => MODELS.filter((m) => !allowed || allowed.has(m.id)),
    [allowed],
  );
  const model =
    stored && options.some((m) => m.id === stored)
      ? stored
      : defaultModelId(features);

  const choose = useCallback((id) => {
    try {
      localStorage.setItem(key(), id);
    } catch {
      // Sem storage: vale até recarregar.
    }
    setStored(id);
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);

  const name = MODELS.find((m) => m.id === model)?.name || model;
  return { model, name, options, choose };
}
