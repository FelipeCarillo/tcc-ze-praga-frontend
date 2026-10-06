import { riskOf } from "../utils/severity";

/**
 * Dados do "Relatório da lavoura" (TCC-099) — sem jsPDF, para testar.
 *
 * Tudo aqui é derivado dos laudos e do cadastro: o resumo "qualitativo" é
 * montado por regra a partir dos números, sem chamar modelo de linguagem,
 * e nunca afirma o que os dados não mostram.
 */

const pct = (c) => (Number.isFinite(c) ? Math.round(c * 100) + "%" : "-");
const dia = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const diaAno = (iso) => new Date(iso).toLocaleDateString("pt-BR");
const isSaudavel = (d) => riskOf(d.severity).rank === 0 || /saud/i.test(d.disease || "");

export function nomeTalhao(t) {
  return t ? `${t.nome}${t.apelido ? " · " + t.apelido : ""}` : "Sem talhão";
}

function juntar(lista) {
  if (lista.length <= 1) return lista.join("");
  return lista.slice(0, -1).join(", ") + " e " + lista[lista.length - 1];
}

/**
 * @param {object} p
 * @param {object|null} p.fazenda  fazenda com `talhoes` (ou null = todos os laudos)
 * @param {Array} p.laudos         laudos (shape do historyService), qualquer ordem
 * @param {Date} [p.now]
 */
export function buildReportData({ fazenda, laudos, now = new Date() }) {
  const talhoes = fazenda?.talhoes || [];
  const ids = new Set(talhoes.map((t) => t.id));
  const doPeriodo = (fazenda ? laudos.filter((d) => ids.has(d.talhaoId)) : laudos)
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const cronologico = doPeriodo.slice().reverse();

  const porTalhao = talhoes.map((t) => {
    const lista = cronologico.filter((d) => d.talhaoId === t.id);
    const ultimo = lista[lista.length - 1] || null;
    return { talhao: t, laudos: lista, ultimo, risco: ultimo ? riskOf(ultimo.severity) : null };
  });

  const ocorrencias = Object.entries(
    doPeriodo.reduce((acc, d) => {
      const k = isSaudavel(d) ? "Saudável" : d.disease || "Não identificado";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([nome, n]) => ({ nome, n, saudavel: nome === "Saudável" }))
    .sort((a, b) => b.n - a.n);

  const doencas = ocorrencias.filter((o) => !o.saudavel);
  const altoRisco = porTalhao.filter((p) => p.risco?.rank === 3);
  const areaTalhoes = talhoes.reduce((s, t) => s + (Number(t.hectares) || 0), 0);
  const hectares = areaTalhoes || Number(fazenda?.hectares) || 0;

  return {
    periodo: doPeriodo.length
      ? `${dia(cronologico[0].timestamp)} a ${diaAno(doPeriodo[0].timestamp)}`
      : "sem laudos",
    geradoEm: `${diaAno(now)}, ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    kpis: {
      laudos: doPeriodo.length,
      talhoes: talhoes.length,
      hectares,
      doencas: doencas.length,
      altoRisco: altoRisco.length,
    },
    resumo: resumo(porTalhao, doencas, doPeriodo),
    ocorrencias,
    prioridades: prioridades(porTalhao),
    porTalhao: porTalhao.map((p) => ({ ...p, nota: notaTalhao(p) })),
    laudos: doPeriodo,
    anterior: (d) => {
      const lista = cronologico.filter((x) => x.talhaoId && x.talhaoId === d.talhaoId);
      const i = lista.findIndex((x) => x.id === d.id);
      return i > 0 ? lista[i - 1] : null;
    },
  };
}

function tendenciaConfianca(lista, doenca) {
  const mesmos = lista.filter((d) => d.disease === doenca && Number.isFinite(d.confidence));
  if (mesmos.length < 2) return "";
  const a = mesmos[0].confidence;
  const b = mesmos[mesmos.length - 1].confidence;
  if (Math.abs(b - a) < 0.02) return "";
  return `, com a confiança ${b > a ? "subindo" : "caindo"} de ${pct(a)} para ${pct(b)}`;
}

function resumo(porTalhao, doencas, laudos) {
  if (!laudos.length) return "Ainda não há laudos neste período. Fotografe uma folha de cada talhão para criar a primeira leitura de referência.";
  const frases = [];
  const top = doencas[0];
  if (top) {
    const onde = porTalhao.filter((p) => p.laudos.some((d) => d.disease === top.nome)).map((p) => nomeTalhao(p.talhao));
    const lista = laudos.filter((d) => d.disease === top.nome).reverse();
    const todos = onde.length === 1 ? `, todos no ${onde[0]}` : onde.length ? `, em ${juntar(onde)}` : "";
    frases.push(
      `${top.nome} foi a ocorrência mais frequente: ${top.n} de ${laudos.length} ${laudos.length === 1 ? "laudo" : "laudos"}${todos}${onde.length === 1 ? tendenciaConfianca(lista, top.nome) : ""}.`,
    );
  } else frases.push(`Todos os ${laudos.length} laudos do período indicaram folha saudável.`);
  for (const p of porTalhao) {
    const nome = nomeTalhao(p.talhao);
    if (!p.laudos.length) {
      frases.push(`O ${nome} ainda não tem leitura neste período.`);
      continue;
    }
    if (top && p.laudos.every((d) => d.disease === top.nome)) continue;
    const doencasAqui = [...new Set(p.laudos.filter((d) => !isSaudavel(d)).map((d) => d.disease))];
    if (!doencasAqui.length)
      frases.push(`O ${nome} segue saudável ${p.laudos.length === 1 ? "na única leitura" : `nas ${p.laudos.length} leituras`}.`);
    else frases.push(`No ${nome} apareceu ${juntar(doencasAqui.map((x) => x.toLowerCase()))}, com ${p.risco.label.toLowerCase()} na última leitura.`);
  }
  return frases.join(" ");
}

function notaTalhao(p) {
  if (!p.laudos.length) return "Nenhuma leitura neste período.";
  const doencas = [...new Set(p.laudos.filter((d) => !isSaudavel(d)).map((d) => d.disease))];
  if (!doencas.length) return `Sem sinal de doença ${p.laudos.length === 1 ? "na leitura" : `nas ${p.laudos.length} leituras`} do período.`;
  if (doencas.length === 1) {
    const n = p.laudos.filter((d) => d.disease === doencas[0]).length;
    return `${doencas[0]} em ${n} de ${p.laudos.length} ${p.laudos.length === 1 ? "leitura" : "leituras"}${tendenciaConfianca(p.laudos, doencas[0])}.`;
  }
  return `${juntar(doencas)}; ${p.risco.label.toLowerCase()} na última leitura.`;
}

function prioridades(porTalhao) {
  const out = [];
  const ordem = porTalhao.slice().sort((a, b) => (b.risco?.rank ?? -2) - (a.risco?.rank ?? -2));
  for (const p of ordem) {
    const nome = nomeTalhao(p.talhao);
    if (!p.ultimo) out.push({ talhao: nome, texto: "fazer a primeira leitura de referência." });
    else if (p.risco.rank === 3)
      out.push({ talhao: nome, texto: `levar o laudo de ${p.ultimo.disease.toLowerCase()} ao agrônomo e definir o manejo nesta semana.` });
    else if (p.risco.rank >= 1)
      out.push({ talhao: nome, texto: `refotografar as mesmas plantas em 7 dias para ver se ${p.ultimo.disease.toLowerCase()} avançou.` });
  }
  return out.slice(0, 3);
}
