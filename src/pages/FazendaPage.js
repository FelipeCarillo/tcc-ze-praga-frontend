import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Skeleton, Typography } from "@mui/material";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Pencil, Plus, Trash2 } from "lucide-react";
import { ErrorState } from "../components/common/Page";
import FarmMap from "../components/Fazenda/FarmMap";
import NovoTalhaoSheet from "../components/Fazenda/NovoTalhaoSheet";
import useFazendas, { summarize } from "../hooks/useFazendas";
import { useFeatures } from "../contexts/FeaturesContext";
import { deleteFazenda } from "../services/fazendasService";
import { deleteTalhao } from "../services/talhoesService";
import { riskOf, riskTrend } from "../utils/severity";
import { farmMotion, fmtHa, local, RiskDot, up } from "./FazendasPage";

function diasDesde(iso) {
  if (!iso) return null;
  const d = Math.floor((Date.now() - new Date(iso + "T12:00:00").getTime()) / 86400000);
  return d >= 0 ? d : null;
}

function linhaTalhao(t) {
  const parts = [];
  if (t.hectares) parts.push(fmtHa(t.hectares));
  const d = diasDesde(t.dataSemeadura);
  if (d != null) parts.push(`${d} ${d === 1 ? "dia" : "dias"} de semeadura`);
  parts.push(t.total ? `${t.total} ${t.total === 1 ? "laudo" : "laudos"}` : "sem laudo");
  return parts.join(" · ");
}

function Tile({ value, label, alert }) {
  return (
    <Box
      sx={{
        bgcolor: alert ? "#FDE4E1" : "background.paper",
        border: "1px solid",
        borderColor: alert ? "#F5C2BC" : "divider",
        borderRadius: "14px",
        px: 1.5,
        py: 1.25,
        color: alert ? "#8A1C12" : "text.primary",
        minWidth: 0,
      }}
    >
      <Box sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontWeight: 600, fontSize: "1.25rem" }}>{value}</Box>
      <Box sx={{ fontSize: "0.75rem", fontWeight: alert ? 700 : 500, color: alert ? "inherit" : "text.secondary" }}>{label}</Box>
    </Box>
  );
}

const LEGENDA = [
  { cor: "#8A1C12", rotulo: "Risco alto" },
  { cor: "#C2570C", rotulo: "Médio" },
  { cor: "#E8B931", rotulo: "Baixo" },
  { cor: "#1B4D2E", rotulo: "Saudável" },
];

/**
 * Uma fazenda — m-Talhoes do canvas (TCC-096): resumo, mapa esquemático com
 * os talhões dela e a lista. Daqui se cria talhão, edita e apaga a fazenda.
 */
export default function FazendaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fazendas, loading, error, reload, choose } = useFazendas();
  const [sheet, setSheet] = useState(null); // {talhao?} | null
  const [confirm, setConfirm] = useState(null); // {tipo, alvo}
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const features = useFeatures();
  const fazenda = fazendas.find((f) => f.id === id);

  // Abrir uma fazenda a torna a ativa (a do Início).
  useEffect(() => {
    if (fazenda) choose(fazenda.id);
  }, [fazenda, choose]);

  if (loading)
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2.5, pt: 3 }}>
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: "14px" }} />
        <Skeleton variant="rounded" height={220} sx={{ mt: 2, borderRadius: "20px" }} />
      </Box>
    );
  if (error) return <Box sx={{ maxWidth: 720, mx: "auto", px: 2.5, pt: 3 }}><ErrorState message={error} onRetry={reload} /></Box>;
  if (!fazenda)
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2.5, pt: 4 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.25rem" }}>Fazenda não encontrada</Typography>
        <Button component={Link} to="/fazendas" sx={{ mt: 1 }}>Ver suas fazendas</Button>
      </Box>
    );

  const s = summarize(fazenda);
  const apagar = async () => {
    setBusy(true);
    try {
      if (confirm.tipo === "fazenda") {
        await deleteFazenda(fazenda.id);
        navigate("/fazendas", { replace: true });
        return;
      }
      await deleteTalhao(confirm.alvo.id);
      setConfirm(null);
      reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ ...farmMotion, maxWidth: 720, mx: "auto", px: { xs: 2.5, md: 4 }, pt: { xs: 1.5, md: 4 }, pb: 14 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: -1.5 }}>
        <IconButton component={Link} to="/fazendas" aria-label="Voltar para fazendas" sx={{ width: 44, height: 44 }}>
          <ChevronLeft size={24} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.75rem", fontWeight: 600, color: "primary.main", letterSpacing: ".06em", textTransform: "uppercase" }} noWrap>
            Fazendas{local(fazenda) ? ` › ${local(fazenda).replace("/", " · ")}` : ""}
          </Typography>
          <Typography component="h1" sx={{ m: 0, fontSize: { xs: "1.625rem", md: "2.25rem" }, fontWeight: 800, fontStretch: "112%", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            <Box component={Link} to="/fazendas" aria-label={`${fazenda.nome}. Trocar de fazenda`} sx={{ color: "text.primary", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0.75, minHeight: 44 }}>
              {fazenda.nome}
              <ChevronDown size={20} strokeWidth={2.6} aria-hidden="true" />
            </Box>
          </Typography>
        </Box>
        <IconButton component={Link} to={`/fazendas/${fazenda.id}/editar`} aria-label="Editar fazenda">
          <Pencil size={18} />
        </IconButton>
      </Box>

      <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, ...up(0) }}>
        <Tile value={s.talhoes} label={s.talhoes === 1 ? "talhão" : "talhões"} />
        <Tile value={s.hectares ? fmtHa(s.hectares).replace(" ha", "") : "—"} label={s.hectares ? "hectares" : "sem área"} />
        <Tile value={s.altoRisco} label="em risco alto" alert={s.altoRisco > 0} />
      </Box>

      {fazenda.talhoes.length > 0 && (
        <Box sx={{ mt: 1.5, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "20px", p: 1.5, ...up(1) }}>
          <FarmMap talhoes={fazenda.talhoes} />
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1.25, fontSize: "0.75rem", color: "text.secondary" }}>
            {LEGENDA.map((l) => (
              <Box key={l.rotulo} component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                <Box component="span" sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: l.cor }} />
                {l.rotulo}
              </Box>
            ))}
            <span>Tamanho pela área informada</span>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 1.5, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "20px", overflow: "hidden" }}>
        {fazenda.talhoes.length === 0 && (
          <Typography sx={{ p: 2.5, color: "text.secondary" }}>
            Nenhum talhão nesta fazenda ainda. Cadastre o primeiro para guardar os laudos por área.
          </Typography>
        )}
        {fazenda.talhoes.map((t, i) => {
          const trend = riskTrend(t.trend);
          const r = t.last ? riskOf(t.last.severity) : null;
          return (
            <Box key={t.id} sx={{ display: "flex", alignItems: "center", borderTop: i ? "1px solid" : "none", borderColor: "divider", ...up(i + 2) }}>
              <Box
                component={Link}
                to={`/historico?talhao=${encodeURIComponent(t.id)}&nome=${encodeURIComponent(t.nome)}`}
                sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1.5, alignItems: "center", px: 1.75, py: 1.5, color: "text.primary", textDecoration: "none", "&:hover": { bgcolor: "action.hover" } }}
              >
                <RiskDot talhao={t} size={12} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem" }} noWrap>
                    {t.nome}
                    {t.apelido ? ` · ${t.apelido}` : ""}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{linhaTalhao(t)}</Typography>
                  {r && r.rank > 0 && (
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: r.fg }}>
                      {t.last.disease}
                      {trend && trend.key !== "estavel" ? ` · ${trend.label}` : ` · ${r.label.toLowerCase()}`}
                    </Typography>
                  )}
                </Box>
                <ChevronRight size={16} aria-hidden="true" />
              </Box>
              <IconButton aria-label={`Editar ${t.nome}`} onClick={() => setSheet({ talhao: t })} sx={{ mr: 0.25 }}>
                <Pencil size={16} />
              </IconButton>
              <IconButton aria-label={`Excluir ${t.nome}`} onClick={() => setConfirm({ tipo: "talhao", alvo: t })} sx={{ mr: 0.75 }}>
                <Trash2 size={16} />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      {s.laudos > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<Download size={18} />}
            disabled={exporting || !features?.export_diagnoses}
            onClick={async () => {
              setExporting(true);
              setExportError("");
              try {
                const { exportReport } = await import("../services/exportReport");
                await exportReport({ fazendaId: fazenda.id });
              } catch {
                setExportError("Não foi possível gerar o relatório. Tente novamente.");
              } finally {
                setExporting(false);
              }
            }}
            sx={{ height: 44, px: 2, borderRadius: "12px", border: "1.5px solid", borderColor: "text.primary", color: "text.primary", fontWeight: 700, "&.Mui-disabled": { borderColor: "divider" } }}
          >
            {exporting ? "Preparando relatório…" : "Exportar relatório da fazenda"}
          </Button>
          {!features?.export_diagnoses && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              O relatório em PDF está nos <Link to="/planos">planos Pro e Enterprise</Link>.
            </Typography>
          )}
          {exportError && <Typography role="alert" sx={{ mt: 1, color: "error.main", fontSize: "0.875rem" }}>{exportError}</Typography>}
        </Box>
      )}

      <Box
        component="button"
        type="button"
        onClick={() => setConfirm({ tipo: "fazenda", alvo: fazenda })}
        sx={{ mt: 2.5, border: 0, bgcolor: "transparent", fontFamily: "inherit", color: "#8A1C12", fontWeight: 700, fontSize: "0.875rem", py: 1, cursor: "pointer" }}
      >
        Excluir esta fazenda
      </Box>

      <Box
        component="button"
        type="button"
        onClick={() => setSheet({})}
        sx={{
          position: "fixed",
          right: { xs: 20, md: "calc(50% - 340px)" },
          bottom: { xs: "calc(100px + env(safe-area-inset-bottom))", md: 32 },
          zIndex: 5,
          height: 52,
          px: 2.5,
          borderRadius: 999,
          border: 0,
          bgcolor: "cta.main",
          color: "cta.contrastText",
          fontFamily: "inherit",
          fontWeight: 800,
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
          boxShadow: "0 10px 24px rgba(15,26,19,.22)",
          cursor: "pointer",
          "&:hover": { bgcolor: "cta.hover" },
        }}
      >
        <Plus size={18} strokeWidth={3} aria-hidden="true" />
        Novo talhão
      </Box>

      <NovoTalhaoSheet
        open={Boolean(sheet)}
        fazendas={fazendas}
        fazendaId={fazenda.id}
        talhao={sheet?.talhao}
        onClose={() => setSheet(null)}
        onSaved={() => {
          setSheet(null);
          reload();
        }}
      />

      <Dialog open={Boolean(confirm)} onClose={() => !busy && setConfirm(null)}>
        <DialogTitle>Excluir {confirm?.alvo?.nome}?</DialogTitle>
        <DialogContent>
          {confirm?.tipo === "fazenda"
            ? "A fazenda e todos os talhões dela serão removidos. Os laudos continuam no histórico, sem talhão."
            : "O talhão será removido. Os laudos dele continuam no histórico, sem talhão."}
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirm(null)}>Manter</Button>
          <Button color="error" disabled={busy} onClick={apagar}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
