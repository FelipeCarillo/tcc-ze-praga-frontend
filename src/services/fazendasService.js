import { IS_DEMO } from "../config/runtime";
import api from "./api";
import { getAuthHeaders } from "./authService";
import {
  newId,
  readFazendas,
  readTalhoes,
  writeFazendas,
  writeTalhoes,
} from "./localFarmStore";
import { mapTalhao } from "./talhoesService";

/**
 * Fazendas do produtor (TCC-096) — cada uma com os seus talhões.
 *
 * `GET /api/v1/fazendas` já devolve os talhões aninhados; no modo demo a
 * mesma hierarquia é montada a partir do localStorage.
 */

function mapFazenda(f) {
  return {
    id: f.id,
    nome: f.nome,
    municipio: f.municipio ?? null,
    uf: f.uf ?? null,
    hectares: f.hectares ?? null,
    agronomoNome: f.agronomo_nome ?? null,
    agronomoCrea: f.agronomo_crea ?? null,
    createdAt: f.created_at ?? null,
    talhoes: (f.talhoes || []).map(mapTalhao),
  };
}

function toPayload(data) {
  const out = {};
  const text = (v) => (v == null || String(v).trim() === "" ? null : String(v).trim());
  if ("nome" in data) out.nome = text(data.nome);
  if ("municipio" in data) out.municipio = text(data.municipio);
  if ("uf" in data) out.uf = text(data.uf)?.toUpperCase() ?? null;
  if ("hectares" in data)
    out.hectares = data.hectares === "" || data.hectares == null ? null : Number(data.hectares);
  if ("agronomoNome" in data) out.agronomo_nome = text(data.agronomoNome);
  if ("agronomoCrea" in data) out.agronomo_crea = text(data.agronomoCrea);
  return out;
}

function localNested() {
  const talhoes = readTalhoes();
  return readFazendas().map((f) => ({
    ...f,
    talhoes: talhoes.filter((t) => t.fazendaId === f.id),
  }));
}

function fromPayload(p) {
  return {
    ...("nome" in p && { nome: p.nome }),
    ...("municipio" in p && { municipio: p.municipio }),
    ...("uf" in p && { uf: p.uf }),
    ...("hectares" in p && { hectares: p.hectares }),
    ...("agronomo_nome" in p && { agronomoNome: p.agronomo_nome }),
    ...("agronomo_crea" in p && { agronomoCrea: p.agronomo_crea }),
  };
}

/** @returns {Promise<Array<{id, nome, municipio, uf, hectares, talhoes: Array}>>} */
export async function listFazendas() {
  if (IS_DEMO) {
    readTalhoes(); // garante que talhões antigos já estejam numa fazenda
    return localNested();
  }
  const { data } = await api.get("/api/v1/fazendas", { headers: getAuthHeaders() });
  return (data || []).map(mapFazenda);
}

export async function createFazenda(data) {
  const payload = toPayload(data);
  if (IS_DEMO) {
    const fazenda = {
      id: newId(),
      municipio: null,
      uf: null,
      hectares: null,
      agronomoNome: null,
      agronomoCrea: null,
      createdAt: new Date().toISOString(),
      ...fromPayload(payload),
    };
    writeFazendas([...readFazendas(), fazenda]);
    return { ...fazenda, talhoes: [] };
  }
  const { data: body } = await api.post("/api/v1/fazendas", payload, {
    headers: getAuthHeaders(),
  });
  return mapFazenda(body);
}

export async function updateFazenda(id, data) {
  const payload = toPayload(data);
  if (IS_DEMO) {
    let updated = null;
    writeFazendas(
      readFazendas().map((f) => {
        if (f.id !== id) return f;
        updated = { ...f, ...fromPayload(payload) };
        return updated;
      }),
    );
    if (!updated) throw new Error("Fazenda não encontrada.");
    return { ...updated, talhoes: readTalhoes().filter((t) => t.fazendaId === id) };
  }
  const { data: body } = await api.patch(`/api/v1/fazendas/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return mapFazenda(body);
}

/** Apaga a fazenda e os talhões dela; os laudos ficam sem talhão. */
export async function deleteFazenda(id) {
  if (IS_DEMO) {
    writeFazendas(readFazendas().filter((f) => f.id !== id));
    writeTalhoes(readTalhoes().filter((t) => t.fazendaId !== id));
    return;
  }
  await api.delete(`/api/v1/fazendas/${id}`, { headers: getAuthHeaders() });
}
