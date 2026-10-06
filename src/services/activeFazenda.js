import { getCurrentUserId } from "./authService";

/**
 * Fazenda ativa (TCC-096): a que aparece no Início ("Bom dia · Fazenda X")
 * e abre em "Ver todos". Salva por usuário; `null` = a primeira da lista.
 */

export const ACTIVE_FAZENDA_EVENT = "active-fazenda-changed";

const key = () => "zepraga-fazenda-ativa:" + getCurrentUserId();

export function getActiveFazendaId() {
  try {
    return localStorage.getItem(key()) || null;
  } catch {
    return null;
  }
}

export function setActiveFazendaId(id) {
  try {
    if (id) localStorage.setItem(key(), id);
    else localStorage.removeItem(key());
  } catch {
    // Sem storage: a escolha vale só nesta visita.
  }
  window.dispatchEvent(new CustomEvent(ACTIVE_FAZENDA_EVENT, { detail: id || null }));
}

/** A fazenda ativa dentro da lista — ou a primeira, se a salva sumiu. */
export function pickActive(fazendas, id = getActiveFazendaId()) {
  return fazendas.find((f) => f.id === id) || fazendas[0] || null;
}
