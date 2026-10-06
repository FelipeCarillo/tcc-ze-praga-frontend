import { getCurrentUserId } from "./authService";

/**
 * Armazenamento local de fazendas e talhões (modo demo, TCC-096).
 *
 * Espelha o backend: todo talhão pertence a uma fazenda. Talhões salvos antes
 * das fazendas existirem ganham uma "Minha fazenda", como na migration 0013.
 * Sem `uuid` de propósito: o pacote é ESM e o Jest do CRA não o carrega.
 */

export const DEFAULT_FAZENDA_NOME = "Minha fazenda";

const fazendasKey = () => "zepraga-fazendas:" + getCurrentUserId();
const talhoesKey = () => "zepraga-talhoes:" + getCurrentUserId();

export function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function write(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    throw new Error("Falha ao salvar no armazenamento local.");
  }
}

export const readFazendas = () => read(fazendasKey());
export const writeFazendas = (list) => write(fazendasKey(), list);
export const writeTalhoes = (list) => write(talhoesKey(), list);

/** A fazenda mais antiga; sem nenhuma, cria "Minha fazenda". */
export function defaultFazenda() {
  const list = readFazendas();
  if (list.length) return list[0];
  const fazenda = {
    id: newId(),
    nome: DEFAULT_FAZENDA_NOME,
    municipio: null,
    uf: null,
    hectares: null,
    agronomoNome: null,
    agronomoCrea: null,
    createdAt: new Date().toISOString(),
  };
  writeFazendas([fazenda]);
  return fazenda;
}

/** Talhões já com `fazendaId`; os antigos vão para a fazenda padrão. */
export function readTalhoes() {
  const list = read(talhoesKey());
  if (!list.some((t) => !t.fazendaId)) return list;
  const fallback = defaultFazenda().id;
  const fixed = list.map((t) => (t.fazendaId ? t : { ...t, fazendaId: fallback }));
  writeTalhoes(fixed);
  return fixed;
}

/** Cria um talhão local (na fazenda pedida, se existir, senão na padrão). */
export function createLocalTalhao(data) {
  const fazendaId =
    data.fazendaId && readFazendas().some((f) => f.id === data.fazendaId)
      ? data.fazendaId
      : defaultFazenda().id;
  const hectares = data.hectares === "" || data.hectares == null ? null : Number(data.hectares);
  const talhao = {
    id: newId(),
    createdAt: new Date().toISOString(),
    fazendaId,
    nome: data.nome || "Novo talhão",
    apelido: data.apelido || null,
    hectares,
    cultura: data.cultura || "soja",
    dataSemeadura: data.dataSemeadura || null,
  };
  writeTalhoes([talhao, ...readTalhoes()]);
  return talhao;
}
