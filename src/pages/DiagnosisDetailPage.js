import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Portal, Skeleton, Snackbar, Typography } from "@mui/material";
import { BellRing, Check, ChevronLeft, Download, Leaf, Share2 } from "lucide-react";
import { ErrorState } from "../components/common/Page";
import AuxiliarNotice from "../components/common/AuxiliarNotice";
import ActionChecklist from "../components/Diagnosis/ActionChecklist";
import TalhaoAssign from "../components/Talhao/TalhaoAssign";
import { RiskChip } from "../components/History/HistoryByTalhao";
import { deleteDiagnosis, getDiagnosisById } from "../services/historyService";
import { addReminder, hasReminder } from "../services/reminders";
import { useActionPlan } from "../hooks/useActionPlan";
import { useFeatures } from "../contexts/FeaturesContext";
import { IS_DEMO } from "../config/runtime";

const motion = {
  "@keyframes zpUp": { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } },
  "@keyframes zpFill": { from: { width: 0 } },
  "@keyframes zpZoom": { from: { transform: "scale(1.15)" }, to: { transform: "scale(1)" } },
  "@keyframes zpRing": { from: { strokeDashoffset: 176 } },
  "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
};
const up = (i) => ({ animation: `zpUp .55s ${i * 0.1}s cubic-bezier(.2,.7,.2,1) both` });

function ConfidenceRing({ value }) {
  const c = 2 * Math.PI * 28;
  return (
    <Box sx={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="7" style={{ stroke: "var(--zp-ring-track)" }} />
        <Box
          component="circle"
          cx="32"
          cy="32"
          r="28"
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          transform="rotate(-90 32 32)"
          sx={{ stroke: (t) => t.palette.primary.main, animation: "zpRing 1.3s .3s cubic-bezier(.2,.7,.2,1) both" }}
        />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: (t) => t.typography.fontFamilyMono, fontWeight: 600, fontSize: "0.9375rem" }}>
        {Math.round(value)}%
      </Box>
    </Box>
  );
}

const roundBtn = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  bgcolor: "rgba(11,21,16,.65)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  cursor: "pointer",
  "&:hover": { bgcolor: "rgba(11,21,16,.8)" },
};

/**
 * Laudo — m-Diagnostico do canvas: foto em destaque, anel de confiança,
 * outras hipóteses, plano de ação em checklist por nível e a barra de baixo
 * com o aviso de auxiliar, "Lembrar em 7 dias" e "Perguntar ao Zé". No
 * desktop vira duas colunas, com a foto grande à esquerda.
 */
export default function DiagnosisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const features = useFeatures();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [reminded, setReminded] = useState(() => hasReminder(id));
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setResult(null);
    setError("");
    setReminded(hasReminder(id));
    getDiagnosisById(id)
      .then((d) => {
        if (!active) return;
        setResult(d);
        if (!d) setError("Este registro não foi encontrado.");
      })
      .catch(() => active && setError("Não foi possível abrir este registro. Ele pode ter sido removido."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, version]);

  const { actionPlan, loading: planLoading, error: planError, retry } = useActionPlan(result?.diseaseId);

  const exportPdf = async () => {
    setExporting(true);
    try {
      const { exportDiagnosisPdf } = await import("../services/pdfExport");
      await exportDiagnosisPdf({ ...result, actionPlan });
    } catch {
      setToast("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    const text = `Laudo do Zé Praga: ${result.disease}`;
    try {
      if (navigator.share) await navigator.share({ title: "Zé Praga", text, url });
      else {
        await navigator.clipboard.writeText(url);
        setToast("Link do laudo copiado.");
      }
    } catch {
      // Compartilhamento cancelado: nada a fazer.
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteDiagnosis(result.id);
      navigate("/historico", { replace: true });
    } catch {
      setToast("A exclusão não foi confirmada. Tente de novo.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const remind = () => {
    addReminder(result);
    setReminded(true);
    setToast("Combinado: daqui a 7 dias o Zé te lembra de voltar a esta planta.");
  };

  const confidence = Number.isFinite(result?.confidence) ? Math.max(0, Math.min(1, result.confidence)) * 100 : null;
  const quando = result
    ? new Date(result.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";
  const others = (result?.top3 || []).slice(1).filter((d) => d.disease);

  const actions = result && (
    <>
      <Button
        onClick={remind}
        disabled={reminded}
        startIcon={reminded ? <Check size={18} /> : <BellRing size={18} />}
        sx={{ height: 52, borderRadius: "16px", border: "1.5px solid", borderColor: "text.primary", color: "text.primary", fontWeight: 700, fontSize: "0.9375rem", whiteSpace: "nowrap", "&.Mui-disabled": { borderColor: "divider", color: "text.secondary" } }}
      >
        {reminded ? "Lembrete feito" : "Lembrar em 7 dias"}
      </Button>
      <Button
        component={Link}
        to="/chat"
        sx={{ height: 52, borderRadius: "16px", bgcolor: "cta.main", color: "cta.contrastText", fontWeight: 800, fontSize: "0.9375rem", "&:hover": { bgcolor: "cta.hover" } }}
      >
        Perguntar ao Zé
      </Button>
    </>
  );

  return (
    <Box sx={{ ...motion, "--zp-ring-track": (t) => (t.palette.mode === "dark" ? "#22362A" : "#E4E9DE"), pb: { xs: "170px", md: 8 } }}>
      {error && (
        <Box sx={{ p: 2.5, maxWidth: 720, mx: "auto" }}>
          <Button component={Link} to="/historico" startIcon={<ChevronLeft size={18} />} sx={{ mb: 2 }}>
            Histórico
          </Button>
          <ErrorState message={error} onRetry={() => setVersion((v) => v + 1)} />
        </Box>
      )}
      {loading && (
        <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 0, md: 4 } }}>
          <Skeleton variant="rectangular" height={190} />
          <Box sx={{ p: 2.5 }}>
            <Skeleton height={48} width="70%" />
            <Skeleton height={120} />
          </Box>
        </Box>
      )}
      {!loading && result && (
        <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 0, md: 4 }, pt: { xs: 0, md: 4 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: { xs: 0, md: 5 }, alignItems: "start" }}>
          {/* Foto */}
          <Box sx={{ position: { xs: "relative", md: "sticky" }, top: { md: 96 }, height: { xs: 190, md: 480 }, overflow: "hidden", bgcolor: "#0B1510", borderRadius: { xs: 0, md: "24px" } }}>
            {result.imageUrl ? (
              <Box component="img" src={result.imageUrl} alt="Folha analisada" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", animation: "zpZoom 1.4s cubic-bezier(.2,.7,.2,1) both" }} />
            ) : (
              <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "#B7C2B4" }}>
                <Leaf size={48} aria-hidden="true" />
              </Box>
            )}
            <Box sx={{ position: "absolute", left: 0, right: 0, top: 0, p: 1.5, display: "flex", justifyContent: "space-between" }}>
              <Box component="button" type="button" aria-label="Voltar" onClick={() => navigate(-1)} sx={roundBtn}>
                <ChevronLeft size={22} strokeWidth={2.2} />
              </Box>
              <Box component="button" type="button" aria-label="Compartilhar laudo" onClick={share} sx={roundBtn}>
                <Share2 size={19} strokeWidth={2.2} />
              </Box>
            </Box>
            <Box sx={{ position: "absolute", left: 12, bottom: { xs: 30, md: 14 }, bgcolor: "rgba(11,21,16,.75)", color: "#EEF2E8", borderRadius: 999, px: 1.5, py: 0.75, fontSize: "0.8125rem", fontWeight: 600 }}>
              {(result.talhaoNome || "Sem talhão") + " · " + quando}
            </Box>
          </Box>

          {/* Folha de baixo (sobe por cima da foto no celular) */}
          <Box sx={{ position: "relative", mt: { xs: "-18px", md: 0 }, bgcolor: "background.default", borderRadius: { xs: "22px 22px 0 0", md: 0 }, px: { xs: 2.5, md: 0 }, pt: { xs: 2.25, md: 0 }, display: "flex", flexDirection: "column", gap: 1.75 }}>
            <Box sx={{ ...up(0), display: "flex", gap: 2, alignItems: "center" }}>
              {confidence !== null && <ConfidenceRing value={confidence} />}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
                <Box sx={{ alignSelf: "flex-start" }}>
                  <RiskChip severity={result.severity} />
                </Box>
                <Typography component="h1" sx={{ m: 0, fontSize: { xs: "1.625rem", md: "2.25rem" }, fontWeight: 800, fontStretch: "112%", letterSpacing: "-0.015em", lineHeight: 1.02 }}>
                  {result.disease}
                </Typography>
                {result.scientificName && (
                  <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", fontStyle: "italic" }}>{result.scientificName}</Typography>
                )}
              </Box>
            </Box>

            <Box sx={up(1)}>
              <TalhaoAssign diagnosis={result} onChange={setResult} />
            </Box>

            {others.length > 0 && (
              <Box sx={{ ...up(1), bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "16px", px: 1.75, py: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.secondary" }}>Outras hipóteses</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 120px) minmax(0, 1fr) 44px", gap: 1, alignItems: "center", fontSize: "0.8125rem" }}>
                  {others.map((d, i) => {
                    const pct = Math.max(0, Math.min(1, d.confidence || 0)) * 100;
                    return (
                      <React.Fragment key={d.diseaseId || i}>
                        <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.disease}</Box>
                        <Box sx={{ height: 6, bgcolor: "surface.muted", borderRadius: 999, overflow: "hidden" }}>
                          <Box sx={{ width: `${Math.max(pct, 2)}%`, height: "100%", bgcolor: "#8A9B86", borderRadius: 999, animation: "zpFill 1.1s .4s cubic-bezier(.2,.7,.2,1) both" }} />
                        </Box>
                        <Box component="span" sx={{ fontFamily: (t) => t.typography.fontFamilyMono, textAlign: "right" }}>
                          {pct.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Box sx={up(2)}>
              {planLoading ? (
                <Skeleton variant="rounded" height={180} sx={{ borderRadius: "14px" }} />
              ) : planError ? (
                <ErrorState message="As orientações não carregaram." onRetry={retry} />
              ) : actionPlan ? (
                <ActionChecklist diagnosisId={result.id} plan={actionPlan} />
              ) : (
                <Typography color="text.secondary">Ainda não há plano de ação cadastrado para esta hipótese.</Typography>
              )}
            </Box>

            <Box sx={{ ...up(3), display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
              <Button
                size="small"
                startIcon={<Download size={16} />}
                disabled={!features?.export_diagnoses || exporting || planLoading}
                onClick={exportPdf}
              >
                {exporting ? "Preparando PDF…" : "Exportar laudo em PDF"}
              </Button>
              {!features?.export_diagnoses && (
                <Typography variant="caption" color="text.secondary">
                  Exportação nos planos Pro e Enterprise.
                </Typography>
              )}
              {IS_DEMO && (
                <Typography variant="caption" color="text.secondary">
                  Resultado simulado (demonstração).
                </Typography>
              )}
              <Button size="small" color="error" onClick={() => setConfirmDelete(true)} sx={{ ml: "auto" }}>
                Excluir laudo
              </Button>
            </Box>

            {/* Desktop: ações e aviso no fluxo da página. */}
            <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 1.25 }}>
              <AuxiliarNotice />
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>{actions}</Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Celular: barra fixa do m-Diagnostico (Portal: a transição de rota usa
          transform e prenderia o position: fixed). */}
      {!loading && result && (
        <Portal>
          <Box sx={{ display: { xs: "grid", md: "none" }, position: "fixed", left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", px: 2, pt: 1.25, pb: "calc(20px + env(safe-area-inset-bottom))", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <AuxiliarNotice compact />
            </Box>
            {actions}
          </Box>
        </Portal>
      )}
      <Dialog open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} aria-labelledby="excluir-laudo">
        <DialogTitle id="excluir-laudo">Excluir este laudo?</DialogTitle>
        <DialogContent>
          <Alert severity="warning">Esta ação não pode ser desfeita. O laudo sai do histórico.</Alert>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setConfirmDelete(false)}>Manter</Button>
          <Button color="error" variant="contained" disabled={deleting} onClick={remove}>
            {deleting ? "Excluindo…" : "Confirmar exclusão"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
