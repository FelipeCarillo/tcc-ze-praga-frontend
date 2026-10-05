import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ArrowRight, Camera, Leaf, MapPin } from "lucide-react";
import { riskOf, riskTrend } from "../../utils/severity";
import { setActiveTalhao } from "../../services/activeTalhao";

const dateFmt = { day: "2-digit", month: "short" };

export function RiskChip({ severity, size = "small" }) {
  const r = riskOf(severity);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: size === "small" ? 1 : 1.25,
        py: 0.25,
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
function TrendLine({ series }) {
  if (series.length < 2) return null;
  const w = 76,
    h = 30,
    pad = 4;
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
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 120,
          animation: "zpDraw 1.1s .2s ease-out both",
        }}
      />
      {pts.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={c} />
      ))}
    </svg>
  );
}

function Thumb({ d }) {
  return d.imageUrl ? (
    <Box
      component="img"
      src={d.imageUrl}
      alt=""
      loading="lazy"
      sx={{
        width: 52,
        height: 52,
        borderRadius: 3,
        objectFit: "cover",
        flexShrink: 0,
        bgcolor: "background.default",
      }}
    />
  ) : (
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: 3,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
      }}
    >
      <Leaf size={22} aria-hidden="true" />
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
    navigate("/chat");
  };
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
        animation: `zpUp .5s ${Math.min(index, 6) * 0.07}s cubic-bezier(.2,.7,.2,1) both`,
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
          <Stack direction="row" alignItems="center" gap={0.75}>
            {group.talhaoId ? <MapPin size={16} aria-hidden="true" /> : null}
            <Typography
              component="h2"
              sx={{ fontWeight: 800, fontSize: "1.0625rem" }}
              noWrap
            >
              {nome}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {group.total === 0
              ? "Nenhum laudo ainda"
              : `${group.total} ${group.total === 1 ? "laudo" : "laudos"}${trend ? " · " + trend.label : ""}`}
          </Typography>
        </Box>
        <TrendLine series={group.severityTrend} />
      </Stack>

      {group.recent.map((d) => (
        <Box
          key={d.id}
          component={Link}
          to={"/historico/" + d.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { bgcolor: "surface.sunken" },
          }}
        >
          <Thumb d={d} />
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem" }} noWrap>
              {d.disease}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {new Date(d.timestamp).toLocaleDateString("pt-BR", dateFmt)}
              {Number.isFinite(d.confidence)
                ? " · " +
                  (d.confidence * 100).toLocaleString("pt-BR", {
                    maximumFractionDigits: 0,
                  }) +
                  "%"
                : ""}
            </Typography>
          </Box>
          <RiskChip severity={d.severity} />
        </Box>
      ))}

      <Box
        sx={{
          px: 1,
          py: 0.75,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {group.total > group.recent.length ? (
          <Button
            size="small"
            endIcon={<ArrowRight size={16} />}
            onClick={() => onShowAll(group)}
          >
            Ver os {group.total} laudos
          </Button>
        ) : (
          <span />
        )}
        <Button
          size="small"
          startIcon={<Camera size={16} />}
          onClick={analyzeHere}
        >
          {group.talhaoId ? "Analisar neste talhão" : "Nova análise"}
        </Button>
      </Box>
    </Box>
  );
}

/**
 * Histórico agrupado por talhão (TCC-093): um cartão por talhão com os laudos
 * mais recentes e a linha de tendência de risco, como no canvas de design.
 */
export default function HistoryByTalhao({ groups, onShowAll }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2,
        "@keyframes zpUp": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "none" },
        },
        "@keyframes zpDraw": {
          from: { strokeDashoffset: 120 },
          to: { strokeDashoffset: 0 },
        },
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
