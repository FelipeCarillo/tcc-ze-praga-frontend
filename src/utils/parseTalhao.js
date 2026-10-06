/**
 * Lê a descrição de um talhão dita na conversa (modo demo, TCC-098) —
 * "Talhão 9, do Rio, uns 40 hectares. Plantei dia 12 de setembro." vira
 * `{ nome: "Talhão 9", apelido: "Rio", hectares: 40, dataSemeadura: "2026-09-12" }`.
 *
 * No backend quem faz isso é o LLM ao chamar `register_talhao`; no demo, sem
 * modelo de linguagem, a leitura é por regra — e o que não for reconhecido
 * fica de fora em vez de ser inventado.
 */

const MESES = {
  janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

const pad = (n) => String(n).padStart(2, "0");

function capitalizar(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseTalhao(texto, now = new Date()) {
  const t = String(texto || "").trim();
  const out = { nome: null, apelido: null, hectares: null, dataSemeadura: null };

  const nome = t.match(/talh[aã]o\s+(n[ºo°.]?\s*)?([\p{L}\d-]+)/iu);
  if (nome) out.nome = `Talhão ${nome[2]}`;

  const apelido = t.match(/\b(?:do|da|de|dos|das)\s+(?!sete|set|out|jan|fev|mar|abr|mai|jun|jul|ago|nov|dez)([\p{Lu}][\p{L}]+(?:\s+[\p{Lu}][\p{L}]+)?)/u)
    || t.match(/apelido\s*:?\s*([\p{L}][\p{L} ]+?)(?=[,.;]|$)/iu);
  if (apelido) out.apelido = capitalizar(apelido[1].trim());

  const area = t.match(/(\d+(?:[.,]\d+)?)\s*(?:ha\b|hectares?)/i);
  if (area) out.hectares = Number(area[1].replace(",", "."));

  const numerica = t.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  const extenso = t.match(/dia\s+(\d{1,2})\s+de\s+([\p{L}]+)(?:\s+de\s+(\d{4}))?/iu);
  let d = null;
  let m = null;
  let y = now.getFullYear();
  if (numerica) {
    d = Number(numerica[1]);
    m = Number(numerica[2]);
    if (numerica[3]) y = Number(numerica[3].length === 2 ? "20" + numerica[3] : numerica[3]);
  } else if (extenso && MESES[extenso[2].toLowerCase()]) {
    d = Number(extenso[1]);
    m = MESES[extenso[2].toLowerCase()];
    if (extenso[3]) y = Number(extenso[3]);
  }
  if (d && m && d <= 31 && m <= 12) {
    // Data de plantio no futuro é do ano passado ("plantei dia 20 de dezembro" em janeiro).
    if (!numerica?.[3] && !extenso?.[3] && new Date(y, m - 1, d) > now) y -= 1;
    out.dataSemeadura = `${y}-${pad(m)}-${pad(d)}`;
  }

  if (!out.nome) out.nome = out.apelido ? `Talhão ${out.apelido}` : "Novo talhão";
  return out;
}

/** "cria o talhão 9 do Rio, 40 hectares" — pedido de cadastro na conversa? */
export function pedeCadastroDeTalhao(texto) {
  return /\b(cri[ae]|cadastr[ae]|registr[ae]|adicion[ae])\b.*\btalh[aã]o\b/i.test(String(texto || ""));
}
