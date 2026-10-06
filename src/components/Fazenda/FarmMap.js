import React from "react";
import { Box } from "@mui/material";
import { riskOf } from "../../utils/severity";

/**
 * Divide o retângulo em blocos proporcionais ao peso (área do talhão).
 * Corte binário: separa a lista em duas metades de peso parecido e corta
 * pelo lado mais comprido — blocos legíveis sem depender de biblioteca.
 */
export function layoutBlocks(items, x, y, w, h) {
  if (!items.length) return [];
  if (items.length === 1) return [{ ...items[0], x, y, w, h }];
  const total = items.reduce((s, i) => s + i.weight, 0);
  let acc = 0;
  let cut = 1;
  for (let i = 0; i < items.length - 1; i += 1) {
    acc += items[i].weight;
    cut = i + 1;
    if (acc >= total / 2) break;
  }
  const first = items.slice(0, cut);
  const share = first.reduce((s, i) => s + i.weight, 0) / total;
  if (w >= h) {
    const w1 = w * share;
    return [
      ...layoutBlocks(first, x, y, w1, h),
      ...layoutBlocks(items.slice(cut), x + w1, y, w - w1, h),
    ];
  }
  const h1 = h * share;
  return [
    ...layoutBlocks(first, x, y, w, h1),
    ...layoutBlocks(items.slice(cut), x, y + h1, w, h - h1),
  ];
}

const FILL = {
  3: { bg: "#8A1C12", fg: "#FFFFFF", sub: "#FBD5D0" },
  2: { bg: "#C2570C", fg: "#FFFFFF", sub: "#FDE9D7" },
  1: { bg: "#E8B931", fg: "#0F1A13", sub: "#3F3204" },
  0: { bg: "#1B4D2E", fg: "#FFFFFF", sub: "#C8F169" },
};
const GAP = 4;

/**
 * Mapa esquemático da fazenda (m-Talhoes): um bloco por talhão, com o
 * tamanho pela área informada e a cor pelo risco do último laudo. Não é um
 * mapa geográfico — o sistema não guarda o contorno dos talhões.
 */
export default function FarmMap({ talhoes, width = 324, height = 168 }) {
  const known = talhoes.map((t) => Number(t.hectares) || 0).filter(Boolean);
  // Sem área informada, o talhão entra com o tamanho médio dos outros.
  const fallback = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 1;
  const items = talhoes
    .map((t) => ({ t, weight: Number(t.hectares) || fallback }))
    .sort((a, b) => b.weight - a.weight);
  const blocks = layoutBlocks(items, 0, 0, width, height);

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Mapa esquemático: área de cada talhão, colorida pelo risco do último laudo"
      sx={{
        display: "block",
        width: "100%",
        height: "auto",
        color: "text.primary",
        "@keyframes zpGrow": { from: { opacity: 0, transform: "scale(.92)" }, to: { opacity: 1, transform: "none" } },
        "& g": { transformBox: "fill-box", transformOrigin: "center", animation: "zpGrow .6s cubic-bezier(.2,.7,.2,1) both" },
        "@media (prefers-reduced-motion: reduce)": { "& g": { animation: "none" } },
      }}
    >
      {blocks.map(({ t, x, y, w, h }, i) => {
        const rank = t.last ? riskOf(t.last.severity).rank : -1;
        const c = FILL[rank];
        const bw = Math.max(0, w - GAP);
        const bh = Math.max(0, h - GAP);
        const roomy = bw > 70 && bh > 48;
        return (
          <g key={t.id} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
            <title>{`${t.nome}${t.hectares ? ` · ${t.hectares} ha` : ""}`}</title>
            <rect
              x={x}
              y={y}
              width={bw}
              height={bh}
              rx="12"
              fill={c ? c.bg : "rgba(138,155,134,.10)"}
              stroke={c ? "none" : "#8A9B86"}
              strokeWidth={c ? 0 : 1.5}
              strokeDasharray={c ? undefined : "5 4"}
            />
            {bw > 34 && (
              <text x={x + 10} y={y + 22} fill={c ? c.fg : "currentColor"} fontFamily="Archivo, sans-serif" fontWeight="800" fontSize={roomy ? 14 : 12}>
                {roomy ? t.nome : t.nome.slice(0, 6)}
              </text>
            )}
            {roomy && t.apelido && (
              <text x={x + 10} y={y + 40} fill={c ? c.sub : "#8A9B86"} fontFamily="Archivo, sans-serif" fontSize="12">
                {t.apelido}
              </text>
            )}
            {bh > 40 && bw > 50 && t.hectares ? (
              <text x={x + 10} y={y + bh - 12} fill={c ? c.fg : "currentColor"} fontFamily="JetBrains Mono, monospace" fontSize="12">
                {`${t.hectares} ha`}
              </text>
            ) : null}
          </g>
        );
      })}
    </Box>
  );
}
