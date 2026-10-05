import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Collapse, Typography } from "@mui/material";
import { BookOpen, ChevronDown, ExternalLink, Lock } from "lucide-react";

const LEVELS = [
  { id: "essencial", label: "Essencial" },
  { id: "campo", label: "No campo" },
  { id: "especialista", label: "Especialista" },
];

const storeKey = (id) => "zepraga-checklist:" + id;
function readDone(id) {
  try {
    return JSON.parse(localStorage.getItem(storeKey(id))) || {};
  } catch {
    return {};
  }
}

/**
 * Plano de ação do laudo como checklist em abas — m-Diagnostico do canvas.
 *
 * As abas seguem os níveis do plano: o backend só entrega os que o plano do
 * usuário libera; os demais aparecem com cadeado e um convite para os planos
 * (o "Especialista" só aparece quando liberado, para não poluir o Gratuito).
 * O "feito" de cada item fica no aparelho, por laudo.
 */
export default function ActionChecklist({ diagnosisId, plan }) {
  const has = (lvl) => Array.isArray(plan?.[lvl]) && plan[lvl].length > 0;
  const tabs = LEVELS.filter((l) => l.id !== "especialista" || has(l.id));
  const [active, setActive] = useState(
    () => tabs.find((t) => has(t.id))?.id || "essencial",
  );
  const [done, setDone] = useState(() => readDone(diagnosisId));
  const [showSources, setShowSources] = useState(false);

  useEffect(() => setDone(readDone(diagnosisId)), [diagnosisId]);

  const toggle = (lvl, i) => {
    const k = `${lvl}:${i}`;
    const next = { ...done, [k]: !done[k] };
    setDone(next);
    try {
      localStorage.setItem(storeKey(diagnosisId), JSON.stringify(next));
    } catch {
      // Sem storage: vale só nesta visita.
    }
  };

  const locked = !has(active);
  const items = has(active) ? plan[active] : [];
  const sources = plan?.sources || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        role="tablist"
        aria-label="Nível do plano"
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          bgcolor: "surface.muted",
          borderRadius: "14px",
          p: 0.5,
        }}
      >
        {tabs.map((t) => {
          const on = active === t.id;
          const isLocked = !has(t.id);
          return (
            <Box
              key={t.id}
              component="button"
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              sx={{
                height: 44,
                border: 0,
                borderRadius: "11px",
                fontFamily: "inherit",
                fontSize: "0.9375rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                bgcolor: on ? "background.paper" : "transparent",
                color: on ? "text.primary" : "text.secondary",
                fontWeight: on ? 800 : 600,
              }}
            >
              {isLocked && (
                <Lock size={14} aria-label="bloqueado no seu plano" />
              )}
              {t.label}
            </Box>
          );
        })}
      </Box>

      {locked ? (
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: "14px",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            Disponível nos planos Pro e Enterprise
          </Typography>
          <Typography variant="body2" color="text.secondary">
            O plano completo traz o manejo no campo, com doses, intervalos e o
            que monitorar.
          </Typography>
          <Box
            component={Link}
            to="/planos"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textDecoration: "none",
            }}
          >
            Ver planos
          </Box>
        </Box>
      ) : (
        items.map((text, i) => {
          const k = `${active}:${i}`;
          return (
            <Box
              key={k}
              component="label"
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "14px",
                px: 1.75,
                py: 1.25,
                fontSize: "0.9375rem",
                lineHeight: 1.4,
                cursor: "pointer",
              }}
            >
              <Box
                component="input"
                type="checkbox"
                checked={Boolean(done[k])}
                onChange={() => toggle(active, i)}
                sx={{
                  width: 22,
                  height: 22,
                  m: 0,
                  flexShrink: 0,
                  accentColor: (t) => t.palette.primary.main,
                  cursor: "pointer",
                }}
              />
              <Box
                component="span"
                sx={{
                  color: done[k] ? "text.secondary" : "text.primary",
                  textDecoration: done[k] ? "line-through" : "none",
                }}
              >
                {text}
              </Box>
            </Box>
          );
        })
      )}

      {sources.length > 0 && (
        <Box>
          <Box
            component="button"
            type="button"
            aria-expanded={showSources}
            onClick={() => setShowSources((v) => !v)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              border: 0,
              bgcolor: "transparent",
              p: 0,
              mt: 0.5,
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "primary.main",
              cursor: "pointer",
            }}
          >
            <BookOpen size={15} aria-hidden="true" />
            Fontes e referências ({sources.length})
            <ChevronDown
              size={15}
              style={{ transform: showSources ? "rotate(180deg)" : "none" }}
              aria-hidden="true"
            />
          </Box>
          <Collapse in={showSources}>
            <Box
              component="ul"
              sx={{
                m: 0,
                mt: 1,
                pl: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                fontSize: "0.875rem",
              }}
            >
              {sources.map((src, i) => (
                <li key={i}>
                  {src.url ? (
                    <Box
                      component="a"
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ color: "primary.main" }}
                    >
                      {src.title || src.url}{" "}
                      <ExternalLink size={12} aria-hidden="true" />
                    </Box>
                  ) : (
                    src.title || String(src)
                  )}
                </li>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}
