import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ArrowRight, Camera, Leaf, MapPin } from "lucide-react";
import { riskOf, riskTrend } from "../../utils/severity";
import { setActiveTalhao } from "../../services/activeTalhao";

const dateFmt = { day: "2-digit", month: "short" };

export function relativeDay(iso) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 14) return `Há ${days} dias`;
  if (days < 60) return `Há ${Math.round(days / 7)} semanas`;
  return new Date(iso).toLocaleDateString("pt-BR", dateFmt);
}

export function RiskChip({ severity, size = "small" }) {
  const r = riskOf(severity);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: size === "small" ? 1.1 : 1.4,
        py: 0.4,
        borderRadius: 999,
        bgcolor: r.bg,
        color: r.fg,
        fontWeight: 700,
        fontSize: size === "small" ? "0.75rem" : "0.8125rem",
        whiteSpace: "nowrap",
      }}
    >
      {r.label}
    </Box>
  );
}

/** Linha da tendência: um ponto por leitura, do mais antigo ao mais recente. */
export function TrendLine({ series }) {
  if (!series || series.length < 2) return null;
  const w = 76;
  const h = 32;
  const pad = 4;
  const step = (w - pad * 2) / (series.length - 1);
  const pts = series.map((s, i) => {
    const rank = Math.max(0, riskOf(s).rank);
    return [
      pad + i * step,
      h - pad - (rank / 3) * (h - pad * 2),
      riskOf(s).dot,
    ];
  });
  const trend = riskTrend(series);
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Leituras recentes: ${trend?.label || ""}`}
      style={{ flexShrink: 0 }}
    >
      <polyline
        points={pts.map((p) => p.slice(0, 2).join(",")).join(" ")}
        fill="none"
        stroke={
          trend?.key === "subindo"
            ? "#B42318"
            : trend?.key === "caindo"
              ? "#2E9E57"
              : "#8A9B86"
        }
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 120,
          animation: "zpDraw 1.2s .4s ease-out both",
        }}
      />
      {pts.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={c} />
      ))}
    </svg>
  );
}

export function Thumb({ d, size = 52 }) {
  return d.imageUrl ? (
    <Box
      component="img"
      src={d.imageUrl}
      alt=""
      loading="lazy"
      sx={{
        width: size,
        height: size,
        borderRadius: "12px",
        objectFit: "cover",
        flexShrink: 0,
        display: "block",
        bgcolor: "surface.muted",
      }}
    />
  ) : (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "12px",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: "surface.muted",
        color: "text.secondary",
      }}
    >
      <Leaf size={22} aria-hidden="true" />
    </Box>
  );
}

/** Uma linha de laudo (m-Historico): miniatura, doença, quando · confiança, risco. */
export function LaudoRow({ d, divider = true, showTalhao = false }) {
  return (
    <Box
      component={Link}
      to={"/historico/" + d.id}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderTop: divider ? "1px solid" : "none",
        borderColor: "divider",
        color: "text.primary",
        textDecoration: "none",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Thumb d={d} />
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem" }} noWrap>
          {d.disease}
        </Typography>
        <Typography
          sx={{ fontSize: "0.8125rem", color: "text.secondary" }}
          noWrap
        >
          {relativeDay(d.timestamp)}
          {Number.isFinite(d.confidence)
            ? " · " + Math.round(d.confidence * 100) + "%"
            : ""}
          {showTalhao ? " · " + (d.talhaoNome || "Sem talhão") : ""}
        </Typography>
      </Box>
      <RiskChip severity={d.severity} />
    </Box>
  );
}

function GroupCard({ group, index, onShowAll }) {
  const navigate = useNavigate();
  const nome = group.talhaoNome || "Sem talhão";
  const trend = riskTrend(group.severityTrend);
  const analyzeHere = () => {
    setActiveTalhao(
      group.talhaoId ? { id: group.talhaoId, nome: group.talhaoNome } : null,
    );
    navigate("/camera");
  };
  const more = group.total > group.recent.length;
  return (
    <Box
      component="section"
      aria-label={nome}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "20px",
        overflow: "hidden",
        animation: `zpUp .55s ${Math.min(index, 6) * 0.08}s cubic-bezier(.2,.7,.2,1) both`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2, pt: 1.75, pb: 1.25 }}
      >
        <Box minWidth={0}>
          <Typography
            component="h2"
            sx={{ fontWeight: 800, fontSize: "1.0625rem" }}
            noWrap
          >
            {nome}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
            {group.total === 0
              ? "Nenhum laudo ainda"
              : `${group.total} ${group.total === 1 ? "laudo" : "laudos"}${trend ? " · " + trend.label : ""}`}
          </Typography>
        </Box>
        <TrendLine series={group.severityTrend} />
      </Stack>
      {group.recent.map((d) => (
        <LaudoRow key={d.id} d={d} />
      ))}
      {(more || group.total === 0) && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {more ? (
            <Button
              size="small"
              endIcon={<ArrowRight size={16} />}
              onClick={() => onShowAll(group)}
            >
              Ver os {group.total} laudos
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<Camera size={16} />}
              onClick={analyzeHere}
            >
              Analisar neste talhão
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

/** Bloco de talhão do desktop (d-Historico): foto do último laudo em cima. */
export function TalhaoTile({ group, index, onShowAll }) {
  const last = group.recent[0];
  const nome = group.talhaoNome || "Sem talhão";
  const trend = riskTrend(group.severityTrend);
  const subtitle = last
    ? `${last.disease}${trend ? " · " + trend.label : ""}`
    : "Sem laudo na última leitura";
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onShowAll(group)}
      aria-label={`${nome}: ver laudos`}
      sx={{
        p: 0,
        textAlign: "left",
        fontFamily: "inherit",
        cursor: "pointer",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "20px",
        overflow: "hidden",
        color: "text.primary",
        transition: "transform .25s ease, box-shadow .25s ease",
        animation: `zpUp .55s ${Math.min(index, 6) * 0.08}s cubic-bezier(.2,.7,.2,1) both`,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 30px rgba(15,26,19,.12)",
        },
      }}
    >
      <Box sx={{ position: "relative", height: 140, bgcolor: "surface.muted" }}>
        {last?.imageUrl && (
          <Box
            component="img"
            src={last.imageUrl}
            alt=""
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
        {last && (
          <Box sx={{ position: "absolute", left: 12, top: 12 }}>
            <RiskChip severity={last.severity} size="medium" />
          </Box>
        )}
        {!last && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "text.secondary",
            }}
          >
            <MapPin size={26} aria-hidden="true" />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          px: 2,
          py: 1.75,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box minWidth={0}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.0625rem" }} noWrap>
            {nome}
          </Typography>
          <Typography
            sx={{ fontSize: "0.8125rem", color: "text.secondary" }}
            noWrap
          >
            {subtitle}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: (t) => t.typography.fontFamilyMono,
            fontSize: "0.8125rem",
            color: "text.secondary",
            whiteSpace: "nowrap",
          }}
        >
          {group.total} {group.total === 1 ? "laudo" : "laudos"}
        </Typography>
      </Box>
    </Box>
  );
}

export const historyMotion = {
  "@keyframes zpUp": {
    from: { opacity: 0, transform: "translateY(12px)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes zpDraw": {
    from: { strokeDashoffset: 120 },
    to: { strokeDashoffset: 0 },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& *": { animation: "none !important" },
  },
};

/**
 * Histórico agrupado por talhão (TCC-093) — m-Historico do canvas: um cartão
 * por talhão com a tendência de risco e os laudos mais recentes.
 */
export default function HistoryByTalhao({ groups, onShowAll }) {
  return (
    <Box
      sx={{
        ...historyMotion,
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
      }}
    >
      {groups.map((g, i) => (
        <GroupCard
          key={g.talhaoId || "sem-talhao"}
          group={g}
          index={i}
          onShowAll={onShowAll}
        />
      ))}
    </Box>
  );
}
