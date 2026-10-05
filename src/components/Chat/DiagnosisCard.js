import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import AuxiliarNotice from "../common/AuxiliarNotice";
import { RiskChip } from "../History/HistoryByTalhao";
import { IS_DEMO } from "../../config/runtime";

/**
 * Card do laudo dentro da conversa — compacto, como no m-Chat: risco, modelo,
 * nome da doença, confiança com barra animada, resumo, o aviso de auxiliar e
 * o rodapé "Ver plano de ação" que abre o laudo completo.
 *
 * O laudo já é salvo sozinho (backend no modo API, o próprio demo no modo
 * demonstração), então o card não tem mais botão de "guardar".
 */
export default function DiagnosisCard({ diagnosis }) {
  const confidence = Number.isFinite(diagnosis.confidence)
    ? Math.max(0, Math.min(1, diagnosis.confidence)) * 100
    : null;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "20px 20px 20px 6px",
        overflow: "hidden",
        "@keyframes zpFill": { from: { width: 0 } },
        "@media (prefers-reduced-motion: reduce)": {
          "& *": { animation: "none !important" },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <RiskChip severity={diagnosis.severity} />
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontFamilyMono,
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
            noWrap
          >
            {IS_DEMO ? "simulado · " : ""}
            {diagnosis.modelUsed || "modelo não informado"}
          </Typography>
        </Box>
        <Typography
          component="h2"
          sx={{
            m: 0,
            fontSize: "1.5rem",
            fontWeight: 800,
            fontStretch: "112%",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
        >
          {diagnosis.disease}
        </Typography>
        {confidence !== null && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
                color: "text.secondary",
                mb: 0.75,
              }}
            >
              <span>Confiança do modelo</span>
              <Box
                component="span"
                sx={{
                  fontFamily: (t) => t.typography.fontFamilyMono,
                  color: "text.primary",
                  fontWeight: 600,
                }}
              >
                {confidence.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
                %
              </Box>
            </Box>
            <Box
              role="progressbar"
              aria-label="Confiança do modelo"
              aria-valuenow={Math.round(confidence)}
              aria-valuemin={0}
              aria-valuemax={100}
              sx={{
                height: 10,
                bgcolor: "surface.muted",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${confidence}%`,
                  height: "100%",
                  bgcolor: "primary.main",
                  borderRadius: 999,
                  animation: "zpFill 1.2s .3s cubic-bezier(.2,.7,.2,1) both",
                }}
              />
            </Box>
          </Box>
        )}
        {diagnosis.description && (
          <Typography
            sx={{
              fontSize: "0.9375rem",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {diagnosis.description}
          </Typography>
        )}
        <AuxiliarNotice compact />
      </Box>
      {diagnosis.id && (
        <Box
          component={Link}
          to={"/historico/" + diagnosis.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.75,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 800,
            fontSize: "0.9375rem",
            textDecoration: "none",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Ver plano de ação
          <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
        </Box>
      )}
    </Box>
  );
}
