import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Pagination,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Camera, Download, Leaf, MapPin, Search, Trash2, X } from "lucide-react";
import { ErrorState } from "../components/common/Page";
import {
  getDiagnosesPage,
  getDiagnoses,
  getDiagnosesByTalhao,
  deleteDiagnosis,
  clearAllDiagnoses,
  SEM_TALHAO,
} from "../services/historyService";
import HistoryByTalhao, { historyMotion, LaudoRow, RiskChip, TalhaoTile, Thumb, relativeDay } from "../components/History/HistoryByTalhao";
import { useFeatures } from "../contexts/FeaturesContext";
import AuxiliarNotice from "../components/common/AuxiliarNotice";

// Filtros por risco (m-Historico / d-Historico). `severity` no backend.
const FILTERS = [
  { id: null, label: "Todos" },
  { id: "alta", label: "Risco alto" },
  { id: "media", label: "Risco médio" },
  { id: "baixa", label: "Risco baixo" },
  { id: "nenhuma", label: "Saudável" },
];

function FilterChips({ value, onChange }) {
  return (
    <Box role="group" aria-label="Filtrar por risco" sx={{ display: "flex", gap: 0.75, overflowX: "auto", pb: 0.25, "&::-webkit-scrollbar": { display: "none" } }}>
      {FILTERS.map((f) => {
        const on = value === f.id;
        return (
          <Box
            key={f.label}
            component="button"
            type="button"
            aria-pressed={on}
            onClick={() => onChange(f.id)}
            sx={{
              flexShrink: 0,
              height: 36,
              px: 1.75,
              borderRadius: 999,
              fontFamily: "inherit",
              fontSize: "0.875rem",
              cursor: "pointer",
              border: on ? 0 : "1px solid",
              borderColor: "divider",
              bgcolor: on ? "text.primary" : "background.paper",
              color: on ? "background.paper" : "text.primary",
              fontWeight: on ? 700 : 600,
            }}
          >
            {f.label}
          </Box>
        );
      })}
    </Box>
  );
}

function SearchField({ value, onChange }) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box component="label" htmlFor="busca-historico" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Buscar no histórico
      </Box>
      <Box sx={{ position: "absolute", left: 14, top: 15, color: "text.secondary", display: "flex", zIndex: 1, pointerEvents: "none" }}>
        <Search size={18} aria-hidden="true" />
      </Box>
      <InputBase
        id="busca-historico"
        type="search"
        placeholder="Buscar doença"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ width: "100%", height: 48, pl: 5.25, pr: 1.75, border: "1.5px solid", borderColor: "divider", borderRadius: "14px", bgcolor: "background.paper", fontSize: "1rem" }}
      />
    </Box>
  );
}

function EmptyState() {
  return (
    <Box sx={{ textAlign: "center", py: 7, px: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "20px" }}>
      <Leaf size={36} aria-hidden="true" />
      <Typography component="h2" sx={{ mt: 2, fontWeight: 800, fontSize: "1.25rem" }}>
        Seu primeiro laudo começa com uma foto
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Os laudos ficam reunidos aqui, por talhão, para você acompanhar a lavoura.
      </Typography>
      <Button component={Link} to="/camera" startIcon={<Camera size={18} />} sx={{ height: 52, px: 3, borderRadius: "16px", bgcolor: "cta.main", color: "cta.contrastText", fontWeight: 800, "&:hover": { bgcolor: "cta.hover" } }}>
        Fotografar folha
      </Button>
    </Box>
  );
}

/**
 * Histórico — m-Historico (celular) e d-Historico (desktop) do canvas.
 *
 * Celular: cartões por talhão; ao buscar, filtrar por risco ou abrir um
 * talhão, vira a lista de laudos. Desktop: blocos de talhão com foto e a
 * tabela "Todos os laudos" com os filtros. Exportar, excluir e limpar tudo
 * continuam disponíveis.
 */
export default function HistoryPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const features = useFeatures();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState(null);
  const [talhaoFilter, setTalhaoFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState(null); // null = ainda carregando; [] sem talhões
  const [groupsSupported, setGroupsSupported] = useState(true);
  const [list, setList] = useState({ items: [], total: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filtering = Boolean(query || risk || talhaoFilter);
  const limit = isDesktop ? 10 : 12;
  // No celular a lista só aparece filtrando (ou sem o agrupado no backend).
  const needList = isDesktop || filtering || !groupsSupported;

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let alive = true;
    getDiagnosesByTalhao()
      .then((g) => alive && setGroups(g))
      .catch((err) => {
        if (!alive) return;
        // Backend anterior ao TCC-093 não tem /por-talhao: só a lista.
        if (err?.response?.status === 404) setGroupsSupported(false);
        else setError("Não foi possível carregar o histórico.");
        setGroups([]);
      });
    return () => {
      alive = false;
    };
  }, [version]);

  useEffect(() => {
    if (!needList) return undefined;
    let alive = true;
    setListLoading(true);
    getDiagnosesPage({ page, limit, search: query, severity: risk || undefined, talhaoId: talhaoFilter?.id })
      .then((r) => {
        if (!alive) return;
        setList(r);
        if (page > 1 && !r.items.length) setPage(page - 1);
      })
      .catch(() => alive && setError("Não foi possível carregar o histórico."))
      .finally(() => alive && setListLoading(false));
    return () => {
      alive = false;
    };
  }, [needList, page, limit, query, risk, talhaoFilter, version]);

  const showTalhao = (group) => {
    setTalhaoFilter({ id: group.talhaoId || SEM_TALHAO, nome: group.talhaoNome || "Sem talhão" });
    setPage(1);
    if (isDesktop) document.getElementById("todos-os-laudos")?.scrollIntoView({ behavior: "smooth" });
  };

  const remove = async () => {
    setBusy(true);
    try {
      if (removing === "all") await clearAllDiagnoses();
      else await deleteDiagnosis(removing.id);
      setRemoving(null);
      setVersion((v) => v + 1);
    } catch {
      setError("A exclusão não foi confirmada. Seus registros continuam na tela.");
    } finally {
      setBusy(false);
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    setError("");
    try {
      const all = await getDiagnoses({ search: query, severity: risk || undefined, talhaoId: talhaoFilter?.id });
      const { exportHistoryPdf } = await import("../services/pdfExport");
      await exportHistoryPdf(all);
    } catch {
      setError("Não foi possível exportar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  const totalLaudos = (groups || []).reduce((n, g) => n + g.total, 0);
  const empty = groups !== null && groupsSupported && totalLaudos === 0 && !filtering;
  const pages = Math.max(1, Math.ceil(list.total / limit));

  const talhaoChip = talhaoFilter && (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, bgcolor: "surface.muted", borderRadius: 999, pl: 1.5, pr: 0.5, py: 0.25, fontWeight: 700, fontSize: "0.875rem", alignSelf: "flex-start" }}>
      <MapPin size={14} aria-hidden="true" />
      {talhaoFilter.nome}
      <IconButton size="small" aria-label="Remover filtro de talhão" onClick={() => { setTalhaoFilter(null); setPage(1); }} sx={{ minWidth: 32, minHeight: 32 }}>
        <X size={15} />
      </IconButton>
    </Box>
  );

  const exportButton = (
    <Button
      startIcon={<Download size={18} />}
      disabled={exporting || !features?.export_diagnoses || totalLaudos === 0}
      onClick={exportPdf}
      sx={{ height: 44, px: 2, borderRadius: "12px", border: "1.5px solid", borderColor: "text.primary", color: "text.primary", fontWeight: 700, "&.Mui-disabled": { borderColor: "divider" } }}
    >
      {exporting ? "Preparando PDF…" : "Exportar relatório"}
    </Button>
  );

  return (
    <Box sx={{ ...historyMotion, maxWidth: 1280, mx: "auto", px: { xs: 2.5, md: 4 }, pt: { xs: 2.25, md: 4 }, pb: 4 }}>
      {/* Cabeçalho */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={2} flexWrap="wrap" sx={{ mb: { xs: 1.5, md: 3.5 } }}>
        <Box>
          <Typography component="h1" sx={{ m: 0, fontSize: { xs: "1.75rem", md: "2.5rem" }, fontWeight: 800, fontStretch: { xs: "112%", md: "115%" }, letterSpacing: "-0.02em", lineHeight: 1 }}>
            <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>Histórico</Box>
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>Histórico por talhão</Box>
          </Typography>
          <Typography sx={{ display: { xs: "none", md: "block" }, mt: 1, color: "text.secondary" }}>
            Acompanhe como o risco muda entre uma leitura e outra.
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>{exportButton}</Box>
      </Stack>

      {error && (
        <Box mb={2}>
          <ErrorState message={error} onRetry={() => { setError(""); setVersion((v) => v + 1); }} />
        </Box>
      )}

      {empty ? (
        <EmptyState />
      ) : isDesktop ? (
        <>
          {/* d-Historico: blocos de talhão */}
          {groupsSupported && (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2, mb: 3.5 }}>
              {groups === null
                ? [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={214} sx={{ borderRadius: "20px" }} />)
                : groups.map((g, i) => <TalhaoTile key={g.talhaoId || "sem"} group={g} index={i} onShowAll={showTalhao} />)}
            </Box>
          )}
          {/* d-Historico: todos os laudos */}
          <Box component="section" id="todos-os-laudos" aria-label="Laudos" sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "20px", overflow: "hidden" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography component="h2" sx={{ fontWeight: 800, fontSize: "1.125rem" }}>
                  Todos os laudos
                </Typography>
                {talhaoChip}
              </Stack>
              <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
                <Box sx={{ width: 220 }}>
                  <SearchField value={search} onChange={setSearch} />
                </Box>
                <FilterChips value={risk} onChange={(v) => { setRisk(v); setPage(1); }} />
              </Stack>
            </Stack>
            <Box sx={{ overflowX: "auto" }}>
              <Box component="table" sx={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: "0.9375rem" }}>
                <thead>
                  <Box component="tr" sx={{ textAlign: "left", fontSize: "0.8125rem", color: "text.secondary" }}>
                    {["Foto", "Diagnóstico", "Talhão", "Risco", "Confiança", "Modelo", "Quando", ""].map((h, i) => (
                      <Box component="th" key={h + i} sx={{ py: 1.5, px: i === 0 ? 2.5 : 1, fontWeight: 600 }}>
                        {h || <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Ações</Box>}
                      </Box>
                    ))}
                  </Box>
                </thead>
                <tbody>
                  {listLoading
                    ? [0, 1, 2].map((i) => (
                        <tr key={i}>
                          <Box component="td" colSpan={8} sx={{ px: 2.5, py: 1 }}>
                            <Skeleton height={48} />
                          </Box>
                        </tr>
                      ))
                    : list.items.map((d) => (
                        <Box component="tr" key={d.id} sx={{ borderTop: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}>
                          <Box component="td" sx={{ px: 2.5, py: 1.25 }}>
                            <Link to={"/historico/" + d.id} aria-label={"Abrir laudo de " + d.disease}>
                              <Thumb d={d} size={48} />
                            </Link>
                          </Box>
                          <Box component="td" sx={{ px: 1, fontWeight: 700 }}>
                            <Box component={Link} to={"/historico/" + d.id} sx={{ color: "text.primary", textDecoration: "none" }}>
                              {d.disease}
                            </Box>
                          </Box>
                          <Box component="td" sx={{ px: 1 }}>{d.talhaoNome || "Sem talhão"}</Box>
                          <Box component="td" sx={{ px: 1 }}><RiskChip severity={d.severity} /></Box>
                          <Box component="td" sx={{ px: 1, fontFamily: (t) => t.typography.fontFamilyMono }}>
                            {Number.isFinite(d.confidence) ? Math.round(d.confidence * 100) + "%" : "—"}
                          </Box>
                          <Box component="td" sx={{ px: 1, fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.8125rem", color: "text.secondary" }}>
                            {d.modelUsed || "—"}
                          </Box>
                          <Box component="td" sx={{ px: 1, color: "text.secondary" }}>{relativeDay(d.timestamp)}</Box>
                          <Box component="td" sx={{ px: 1 }}>
                            <IconButton size="small" aria-label={"Excluir laudo de " + d.disease} onClick={() => setRemoving(d)} sx={{ color: "text.secondary" }}>
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                  {!listLoading && !list.items.length && (
                    <tr>
                      <Box component="td" colSpan={8} sx={{ px: 2.5, py: 4, textAlign: "center", color: "text.secondary" }}>
                        Nenhum laudo com esses filtros.
                      </Box>
                    </tr>
                  )}
                </tbody>
              </Box>
            </Box>
            {pages > 1 && (
              <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
              </Box>
            )}
            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
              <AuxiliarNotice sx={{ borderRadius: 0 }} />
            </Box>
          </Box>
        </>
      ) : (
        /* m-Historico */
        <Stack gap={1.5}>
          <SearchField value={search} onChange={setSearch} />
          <FilterChips value={risk} onChange={(v) => { setRisk(v); setPage(1); }} />
          {talhaoChip}
          {!filtering && groupsSupported ? (
            groups === null ? (
              [0, 1].map((i) => <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: "20px" }} />)
            ) : (
              <>
                <HistoryByTalhao groups={groups} onShowAll={showTalhao} />
                <AuxiliarNotice />
              </>
            )
          ) : listLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: "14px" }} />)
          ) : list.items.length ? (
            <>
              <Typography role="status" sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                {list.total} {list.total === 1 ? "laudo encontrado" : "laudos encontrados"}
              </Typography>
              <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "20px", overflow: "hidden" }}>
                {list.items.map((d, i) => (
                  <LaudoRow key={d.id} d={d} divider={i > 0} showTalhao={!talhaoFilter} />
                ))}
              </Box>
              {pages > 1 && <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" sx={{ alignSelf: "center" }} />}
              <AuxiliarNotice />
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
              <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Nenhum laudo encontrado</Typography>
              <Button onClick={() => { setSearch(""); setRisk(null); setTalhaoFilter(null); }} sx={{ mt: 1 }}>
                Limpar filtros
              </Button>
            </Box>
          )}
          {totalLaudos > 0 && <Box sx={{ alignSelf: "flex-start", mt: 1 }}>{exportButton}</Box>}
        </Stack>
      )}

      {!features?.export_diagnoses && totalLaudos > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          A exportação está disponível nos <Link to="/planos">planos Pro e Enterprise</Link>.
        </Typography>
      )}
      {totalLaudos > 0 && (
        <Button color="error" size="small" onClick={() => setRemoving("all")} sx={{ mt: 2 }}>
          Limpar todo o histórico
        </Button>
      )}

      <Dialog open={!!removing} onClose={() => !busy && setRemoving(null)} aria-labelledby="delete-title">
        <DialogTitle id="delete-title">{removing === "all" ? "Excluir todo o histórico?" : "Excluir este laudo?"}</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Esta ação não pode ser desfeita.{" "}
            {removing === "all"
              ? "Todos os laudos da sua conta serão removidos, inclusive os que não aparecem nesta página."
              : "O laudo será removido do histórico."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setRemoving(null)}>
            Manter
          </Button>
          <Button color="error" variant="contained" disabled={busy} onClick={remove}>
            {busy ? "Excluindo…" : "Confirmar exclusão"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
