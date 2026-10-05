import React from "react";
import { Link } from "react-router-dom";
import { Box, Skeleton, Typography } from "@mui/material";
import { ArrowRight, Leaf } from "lucide-react";
import AuxiliarNotice from "../common/AuxiliarNotice";
import { RiskChip } from "../History/HistoryByTalhao";
import { useActionPlan } from "../../hooks/useActionPlan";

/**
 * Painel do laudo à direita da conversa no desktop (d-Chat): a foto, o risco,
 * a doença, a confiança, o plano essencial e o aviso de auxiliar — sempre do
 * laudo mais recente da conversa.
 */
/**
 * Qual laudo mostrar: o que veio DEPOIS da foto mais recente. Uma foto nova
 * ainda sem resultado não pode aparecer ao lado do laudo da foto anterior —
 * fica "analisando esta folha". Conversa reaberta (sem fotos nas mensagens)
 * mostra o último laudo.
 */
export function pickLaudo(messages) {
  let photoIdx = -1;
  messages.forEach((m, i) => {
    if (m.role === "user" && m.imageUrl) photoIdx = i;
  });
  if (photoIdx >= 0) {
    const diagnosis =
      messages.slice(photoIdx + 1).find((m) => m.diagnosis)?.diagnosis || null;
    return {
      diagnosis,
      photo: diagnosis?.imageUrl || messages[photoIdx].imageUrl,
      waiting: !diagnosis,
    };
  }
  const last =
    [...messages].reverse().find((m) => m.diagnosis)?.diagnosis || null;
  return { diagnosis: last, photo: last?.imageUrl || null, waiting: false };
}

export default function LaudoPanel({ messages }) {
  const { diagnosis, photo, waiting } = pickLaudo(messages);
  const { actionPlan, loading } = useActionPlan(
    diagnosis?.diseaseId,
    Boolean(diagnosis),
  );
  const essencial = Array.isArray(actionPlan?.essencial)
    ? actionPlan.essencial
    : [];
  const confidence = Number.isFinite(diagnosis?.confidence)
    ? Math.max(0, Math.min(1, diagnosis.confidence)) * 100
    : null;

  return (
    <Box
      component="aside"
      aria-label="Laudo"
      sx={{
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        flex: "1 1 340px",
        maxWidth: 420,
        bgcolor: "background.paper",
        borderLeft: "1px solid",
        borderColor: "divider",
        overflowY: "auto",
        "@keyframes zpFill": { from: { width: 0 } },
        "@keyframes zpZoom": {
          from: { transform: "scale(1.12)" },
          to: { transform: "scale(1)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& *": { animation: "none !important" },
        },
      }}
    >
      {!diagnosis ? (
        <>
          {waiting && photo && (
            <Box
              component="img"
              src={photo}
              alt="Folha em análise"
              sx={{
                width: "100%",
                height: 220,
                objectFit: "cover",
                display: "block",
                flexShrink: 0,
              }}
            />
          )}
          <Box
            sx={{
              p: 4,
              my: waiting ? 0 : "auto",
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Leaf size={32} aria-hidden="true" />
            <Typography
              sx={{ mt: 1.5, fontWeight: 700, color: "text.primary" }}
            >
              {waiting ? "Analisando esta folha" : "O laudo aparece aqui"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {waiting
                ? "O resultado desta foto aparece aqui quando o Zé terminar."
                : "Mande uma foto da folha e o resultado fica ao lado da conversa."}
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              position: "relative",
              height: 220,
              overflow: "hidden",
              flexShrink: 0,
              bgcolor: "surface.muted",
            }}
          >
            {photo && (
              <Box
                key={photo}
                component="img"
                src={photo}
                alt="Folha analisada"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  animation: "zpZoom 1.6s cubic-bezier(.2,.7,.2,1) both",
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.75,
            }}
          >
            <Box sx={{ alignSelf: "flex-start" }}>
              <RiskChip severity={diagnosis.severity} size="medium" />
            </Box>
            <Typography
              component="h2"
              sx={{
                m: 0,
                fontSize: "1.875rem",
                fontWeight: 800,
                fontStretch: "115%",
                letterSpacing: "-0.02em",
                lineHeight: 1,
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
                  <span>
                    Confiança{" "}
                    {diagnosis.modelUsed
                      ? `do ${diagnosis.modelUsed}`
                      : "do modelo"}
                  </span>
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
                  sx={{
                    height: 10,
                    bgcolor: "surface.muted",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    key={diagnosis.id}
                    sx={{
                      width: `${confidence}%`,
                      height: "100%",
                      bgcolor: "primary.main",
                      borderRadius: 999,
                      animation:
                        "zpFill 1.2s .4s cubic-bezier(.2,.7,.2,1) both",
                    }}
                  />
                </Box>
              </Box>
            )}
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 800,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              Plano essencial
            </Typography>
            {loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} height={22} />)
            ) : essencial.length ? (
              <Box
                component="ol"
                sx={{
                  m: 0,
                  pl: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  fontSize: "0.9375rem",
                  lineHeight: 1.45,
                }}
              >
                {essencial.slice(0, 5).map((a, i) => (
                  <li key={i}>
                    {typeof a === "string" ? a : a?.text || a?.title || ""}
                  </li>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Ainda não há orientações cadastradas para esta hipótese.
              </Typography>
            )}
            {diagnosis.id && (
              <Box
                component={Link}
                to={`/historico/${diagnosis.id}`}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "primary.main",
                  textDecoration: "none",
                }}
              >
                Abrir o laudo completo
                <ArrowRight size={16} aria-hidden="true" />
              </Box>
            )}
            <AuxiliarNotice />
          </Box>
        </>
      )}
    </Box>
  );
}
