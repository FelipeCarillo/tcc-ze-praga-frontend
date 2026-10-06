import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Skeleton, Typography } from "@mui/material";
import { ArrowRight, ChevronDown, ChevronUp, Plus, Warehouse } from "lucide-react";
import { ErrorState } from "../components/common/Page";
import NovoTalhaoSheet from "../components/Fazenda/NovoTalhaoSheet";
import useFazendas, { summarize } from "../hooks/useFazendas";
import { riskOf } from "../utils/severity";

export const farmMotion = {
  "@keyframes zpUp": { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } },
  "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
};
export const up = (i) => ({ animation: `zpUp .55s ${Math.min(i, 8) * 0.08}s cubic-bezier(.2,.7,.2,1) both` });

export function local(f) {
  return [f.municipio, f.uf].filter(Boolean).join("/");
}

export function fmtHa(n) {
  return Number(n || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " ha";
}

/** Bolinha do talhão: cor do risco do último laudo, tracejada sem laudo. */
export function RiskDot({ talhao, size = 10 }) {
  const has = Boolean(talhao.last);
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        boxSizing: "border-box",
        bgcolor: has ? riskOf(talhao.last.severity).dot : "transparent",
        border: has ? "none" : "2px dashed #8A9B86",
      }}
    />
  );
}

export function talhaoResumo(t) {
  const parts = [];
  if (t.hectares) parts.push(fmtHa(t.hectares));
  if (t.last) {
    const r = riskOf(t.last.severity);
    parts.push(r.rank === 0 ? "saudável" : `${t.last.disease} · ${r.label.toLowerCase()}`);
  } else parts.push("sem laudo");
  return parts.join(" · ");
}

function FazendaSection({ fazenda, open, onToggle, active, onNovoTalhao, index }) {
  const s = summarize(fazenda);
  const situacao =
    s.altoRisco > 0
      ? `${s.altoRisco} ${s.altoRisco === 1 ? "talhão" : "talhões"} em risco alto`
      : s.laudos > 0
        ? "tudo saudável"
        : null;
  const head = [local(fazenda), `${s.talhoes} ${s.talhoes === 1 ? "talhão" : "talhões"}`, s.hectares ? fmtHa(s.hectares) : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <Box
      component="section"
      aria-label={fazenda.nome}
      sx={{
        bgcolor: "background.paper",
        border: active ? "2px solid" : "1px solid",
        borderColor: active ? "primary.main" : "divider",
        borderRadius: "20px",
        overflow: "hidden",
        ...up(index),
      }}
    >
      <Box
        component="button"
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        sx={{ width: "100%", border: 0, bgcolor: "transparent", p: 1.75, display: "flex", gap: 1.5, alignItems: "center", fontFamily: "inherit", textAlign: "left", color: "text.primary", cursor: "pointer" }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: active ? "#1B4D2E" : "surface.muted", color: active ? "#C8F169" : "primary.main", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Warehouse size={22} strokeWidth={2.2} aria-hidden="true" />
        </Box>
        <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
          <Box component="span" sx={{ display: "block", fontWeight: 800, fontSize: "1.0625rem" }}>{fazenda.nome}</Box>
          <Box component="span" sx={{ display: "block", fontSize: "0.8125rem", color: "text.secondary" }}>
            {head}
            {!open && situacao ? ` · ${situacao}` : ""}
          </Box>
        </Box>
        {open ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </Box>

      {open && (
        <>
          <Box sx={{ position: "relative", pl: "36px", pr: 1.75, pb: 0.75 }}>
            <Box aria-hidden="true" sx={{ position: "absolute", left: 35, top: 0, bottom: 30, width: 2, bgcolor: "divider" }} />
            {fazenda.talhoes.map((t, i) => (
              <Box
                key={t.id}
                component={Link}
                to={`/fazendas/${fazenda.id}`}
                sx={{ position: "relative", display: "flex", gap: 1.25, alignItems: "center", py: 1.1, pl: 2.25, color: "text.primary", textDecoration: "none", ...up(i + 1) }}
              >
                <Box component="span" aria-hidden="true" sx={{ position: "absolute", left: 0, top: "50%", width: 12, height: 2, bgcolor: "divider" }} />
                <RiskDot talhao={t} />
                <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                  <Box component="span" sx={{ display: "block", fontWeight: 700, fontSize: "0.9375rem" }}>
                    {t.nome}
                    {t.apelido ? ` · ${t.apelido}` : ""}
                  </Box>
                  <Box component="span" sx={{ display: "block", fontSize: "0.75rem", color: "text.secondary" }}>{talhaoResumo(t)}</Box>
                </Box>
                {t.total > 0 && (
                  <Box component="span" sx={{ fontFamily: (th) => th.typography.fontFamilyMono, fontSize: "0.75rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                    {t.total} {t.total === 1 ? "laudo" : "laudos"}
                  </Box>
                )}
              </Box>
            ))}
            <Box
              component="button"
              type="button"
              onClick={() => onNovoTalhao(fazenda)}
              sx={{ position: "relative", display: "flex", gap: 1.25, alignItems: "center", minHeight: 44, pl: 2.25, border: 0, bgcolor: "transparent", fontFamily: "inherit", color: "primary.main", fontWeight: 800, fontSize: "0.875rem", cursor: "pointer" }}
            >
              <Box component="span" aria-hidden="true" sx={{ position: "absolute", left: 0, top: "50%", width: 12, height: 2, bgcolor: "divider" }} />
              <Plus size={14} strokeWidth={3} aria-hidden="true" />
              Novo talhão nesta fazenda
            </Box>
          </Box>
          <Box
            component={Link}
            to={`/fazendas/${fazenda.id}`}
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.75, py: 1.5, borderTop: "1px solid", borderColor: "divider", color: "primary.main", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
          >
            Ver mapa e situação da fazenda
            <ArrowRight size={16} aria-hidden="true" />
          </Box>
        </>
      )}
    </Box>
  );
}

/**
 * Fazendas e talhões — m-Fazendas do canvas (TCC-096). A hierarquia: cada
 * fazenda abre e mostra os seus talhões dentro, com a cor do último laudo.
 */
export default function FazendasPage() {
  const { fazendas, loading, error, reload, active } = useFazendas();
  const [open, setOpen] = useState(() => new Set());
  const [sheet, setSheet] = useState(null);

  // A fazenda ativa já começa aberta.
  useEffect(() => {
    if (active) setOpen((s) => (s.size ? s : new Set([active.id])));
  }, [active]);

  const totais = fazendas.reduce(
    (acc, f) => {
      const s = summarize(f);
      return { talhoes: acc.talhoes + s.talhoes, hectares: acc.hectares + s.hectares };
    },
    { talhoes: 0, hectares: 0 },
  );

  return (
    <Box sx={{ ...farmMotion, maxWidth: 720, mx: "auto", px: { xs: 2.5, md: 4 }, pt: { xs: 2.25, md: 5 }, pb: 4 }}>
      <Typography component="h1" sx={{ m: 0, fontSize: { xs: "1.625rem", md: "2.25rem" }, fontWeight: 800, fontStretch: "112%", letterSpacing: "-0.02em" }}>
        Fazendas e talhões
      </Typography>
      {!loading && fazendas.length > 0 && (
        <Typography sx={{ mt: 0.5, fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.75rem", color: "text.secondary" }}>
          {fazendas.length} {fazendas.length === 1 ? "fazenda" : "fazendas"} · {totais.talhoes} {totais.talhoes === 1 ? "talhão" : "talhões"}
          {totais.hectares ? ` · ${fmtHa(totais.hectares)}` : ""}
        </Typography>
      )}

      <Box sx={{ mt: 1.75, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {error && <ErrorState message={error} onRetry={reload} />}
        {loading
          ? [0, 1].map((i) => <Skeleton key={i} variant="rounded" height={i ? 76 : 220} sx={{ borderRadius: "20px" }} />)
          : fazendas.map((f, i) => (
              <FazendaSection
                key={f.id}
                fazenda={f}
                index={i}
                active={active?.id === f.id}
                open={open.has(f.id)}
                onToggle={() =>
                  setOpen((s) => {
                    const next = new Set(s);
                    if (next.has(f.id)) next.delete(f.id);
                    else next.add(f.id);
                    return next;
                  })
                }
                onNovoTalhao={setSheet}
              />
            ))}
        {!loading && !error && !fazendas.length && (
          <Typography sx={{ color: "text.secondary" }}>
            Cadastre sua fazenda para organizar os talhões e os laudos de cada área.
          </Typography>
        )}
        {!loading && (
          <Box
            component={Link}
            to="/fazendas/nova"
            sx={{ height: 52, borderRadius: "16px", border: "1.5px dashed", borderColor: "primary.main", bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(200,241,105,.08)" : "#EEF8D6"), display: "flex", alignItems: "center", justifyContent: "center", gap: 1, color: "primary.main", fontWeight: 800, fontSize: "0.9375rem", textDecoration: "none" }}
          >
            <Plus size={16} strokeWidth={3} aria-hidden="true" />
            Cadastrar fazenda
          </Box>
        )}
      </Box>

      <NovoTalhaoSheet
        open={Boolean(sheet)}
        fazendas={fazendas}
        fazendaId={sheet?.id}
        onClose={() => setSheet(null)}
        onSaved={() => {
          setSheet(null);
          reload();
        }}
      />
    </Box>
  );
}
