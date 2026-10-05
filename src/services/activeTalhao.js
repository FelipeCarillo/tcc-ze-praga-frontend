import { getCurrentUserId } from "./authService";

/**
 * Talhão ativo (TCC-093): o talhão onde o produtor está fotografando agora.
 *
 * Fica salvo por usuário no localStorage, para sobreviver ao fechar o app no
 * meio da lavoura, e é lido pelo chat no momento do envio, assim cada laudo
 * nasce no talhão certo. `null` = "Sem talhão".
 */

export const ACTIVE_TALHAO_EVENT = "active-talhao-changed";

const key = () => "zepraga-talhao-ativo:" + getCurrentUserId();

/** @returns {{id: string, nome: string} | null} */
export function getActiveTalhao() {
  try {
    const raw = localStorage.getItem(key());
    const value = raw ? JSON.parse(raw) : null;
    return value && value.id ? { id: value.id, nome: value.nome || "" } : null;
  } catch {
    return null;
  }
}

/** @param {{id: string, nome: string} | null} talhao */
export function setActiveTalhao(talhao) {
  try {
    if (talhao && talhao.id)
      localStorage.setItem(
        key(),
        JSON.stringify({ id: talhao.id, nome: talhao.nome || "" }),
      );
    else localStorage.removeItem(key());
  } catch {
    // Sem storage (aba privada): a escolha vale só até recarregar a página.
  }
  window.dispatchEvent(
    new CustomEvent(ACTIVE_TALHAO_EVENT, { detail: talhao || null }),
  );
}
