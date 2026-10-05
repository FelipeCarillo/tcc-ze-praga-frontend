/**
 * Nível de risco da doença identificada (campo `severity` do laudo).
 *
 * Atenção: é o risco associado à DOENÇA (ferrugem = alto), não a gravidade
 * medida da lesão — o sistema não mede lesão. Por isso os rótulos falam em
 * "risco", nunca em "doença piorando".
 */
export const RISK = {
  alta: {
    label: "Risco alto",
    rank: 3,
    bg: "#FDE4E1",
    fg: "#8A1C12",
    dot: "#B42318",
  },
  media: {
    label: "Risco médio",
    rank: 2,
    bg: "#FDE9D7",
    fg: "#8F3B07",
    dot: "#C2570C",
  },
  baixa: {
    label: "Risco baixo",
    rank: 1,
    bg: "#FBF1C9",
    fg: "#6B4A03",
    dot: "#C9A227",
  },
  nenhuma: {
    label: "Saudável",
    rank: 0,
    bg: "#DDF3E3",
    fg: "#14532D",
    dot: "#2E9E57",
  },
};

const UNKNOWN = {
  label: "Sem classificação",
  rank: -1,
  bg: "#E4E9DE",
  fg: "#2B3A2F",
  dot: "#8A9B86",
};

export function riskOf(severity) {
  return RISK[severity] || UNKNOWN;
}

/**
 * Tendência entre a leitura mais antiga e a mais recente de uma série
 * (do mais antigo ao mais recente). Devolve null com menos de duas leituras.
 * @returns {{key: "subindo"|"caindo"|"estavel", label: string} | null}
 */
export function riskTrend(series = []) {
  const known = series.map((s) => riskOf(s).rank).filter((r) => r >= 0);
  if (known.length < 2) return null;
  const delta = known[known.length - 1] - known[0];
  if (delta > 0) return { key: "subindo", label: "risco subindo" };
  if (delta < 0) return { key: "caindo", label: "risco caindo" };
  return { key: "estavel", label: "estável" };
}
