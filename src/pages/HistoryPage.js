import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ArrowUpRight,
  Camera,
  Download,
  LayoutGrid,
  Leaf,
  List as ListIcon,
  MapPin,
  Trash2,
  X,
} from "lucide-react";
import Page, { LoadingState, ErrorState } from "../components/common/Page";
import {
  getDiagnosesPage,
  getDiagnoses,
  getDiagnosesByTalhao,
  deleteDiagnosis,
  clearAllDiagnoses,
  SEM_TALHAO,
} from "../services/historyService";
import HistoryByTalhao from "../components/History/HistoryByTalhao";
import { useFeatures } from "../contexts/FeaturesContext";
import AuxiliarNotice from "../components/common/AuxiliarNotice";
export default function HistoryPage() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [data, setData] = useState({ items: [], total: 0 }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [removing, setRemoving] = useState(null),
    [busy, setBusy] = useState(false),
    [exporting, setExporting] = useState(false),
    // TCC-093: "talhao" agrupa por talhão (padrão, como no design); "lista"
    // é a lista paginada com busca, opcionalmente filtrada por um talhão.
    [view, setView] = useState("talhao"),
    [talhaoFilter, setTalhaoFilter] = useState(null),
    [groups, setGroups] = useState([]);
  const features = useFeatures();
  const showAll = (group) => {
    setTalhaoFilter({
      id: group.talhaoId || SEM_TALHAO,
      nome: group.talhaoNome || "Sem talhão",
    });
    setPage(1);
    setView("lista");
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    if (view === "talhao") {
      getDiagnosesByTalhao()
        .then((result) => {
          if (!active) return;
          setGroups(result);
          const total = result.reduce((n, g) => n + g.total, 0);
          setData({ items: [], total });
        })
        .catch((err) => {
          if (!active) return;
          // Backend anterior ao TCC-093 não tem /por-talhao: cai na lista em
          // vez de quebrar, assim front e back podem subir em qualquer ordem.
          if (err?.response?.status === 404) setView("lista");
          else setError("Não foi possível carregar o histórico.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }
    getDiagnosesPage({
      page,
      limit: 12,
      search: query,
      talhaoId: talhaoFilter?.id,
    })
      .then((result) => {
        if (active) {
          setData(result);
          if (page > 1 && !result.items.length) setPage(page - 1);
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar o histórico.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, query, version, view, talhaoFilter]);
  const remove = async () => {
    setBusy(true);
    try {
      if (removing === "all") await clearAllDiagnoses();
      else await deleteDiagnosis(removing.id);
      setRemoving(null);
      setVersion((v) => v + 1);
    } catch {
      setError(
        "A exclusão não foi confirmada. Seus registros continuam na tela.",
      );
    } finally {
      setBusy(false);
    }
  };
  const exportPdf = async () => {
    setExporting(true);
    setError("");
    try {
      const all = await getDiagnoses({
        search: view === "lista" ? query : "",
        talhaoId: view === "lista" ? talhaoFilter?.id : undefined,
      });
      const { exportHistoryPdf } = await import("../services/pdfExport");
      await exportHistoryPdf(all);
    } catch {
      setError("Não foi possível exportar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };
  return (
    <Page
      eyebrow="Seu caderno de campo"
      title="Cada folha conta uma história."
      description="Foto, hipótese e data ficam juntos para você retomar cada observação."
      actions={
        <Button
          component={Link}
          to="/chat"
          variant="contained"
          startIcon={<Camera size={19} />}
        >
          Nova análise
        </Button>
      }
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={2}
        alignItems={{ sm: "center" }}
        mb={3}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_, next) => {
            if (!next) return;
            if (next === "talhao") setTalhaoFilter(null);
            setPage(1);
            setView(next);
          }}
          aria-label="Como mostrar o histórico"
          sx={{ "& .MuiToggleButton-root": { px: 2, minHeight: 40, gap: 0.75, fontWeight: 700, textTransform: "none" } }}
        >
          <ToggleButton value="talhao" aria-label="Agrupar por talhão">
            <LayoutGrid size={16} aria-hidden="true" /> Por talhão
          </ToggleButton>
          <ToggleButton value="lista" aria-label="Lista de laudos">
            <ListIcon size={16} aria-hidden="true" /> Lista
          </ToggleButton>
        </ToggleButtonGroup>
        {view === "lista" ? (
          <TextField
            label="Buscar doença"
            placeholder="Ex.: ferrugem"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
        <Button
          startIcon={<Download size={18} />}
          disabled={
            exporting || !data.total || loading || !features?.export_diagnoses
          }
          onClick={exportPdf}
        >
          {exporting ? "Preparando PDF…" : "Exportar resultados"}
        </Button>
      </Stack>
      {!features?.export_diagnoses && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          A exportação está disponível nos{" "}
          <Link to="/planos">planos Pro e Enterprise</Link>.
        </Typography>
      )}
      {view === "lista" && talhaoFilter && (
        <Chip
          icon={<MapPin size={15} />}
          label={"Talhão: " + talhaoFilter.nome}
          onDelete={() => {
            setTalhaoFilter(null);
            setPage(1);
          }}
          deleteIcon={<X size={15} aria-label="Remover filtro de talhão" />}
          sx={{ mb: 2, fontWeight: 700 }}
        />
      )}
      {error && (
        <Box mb={2}>
          <ErrorState
            message={error}
            onRetry={() => setVersion((v) => v + 1)}
          />
        </Box>
      )}
      {loading ? (
        <LoadingState label="Buscando suas análises…" />
      ) : view === "talhao" && data.total > 0 ? (
        <>
          <AuxiliarNotice sx={{ mb: 2 }} />
          <HistoryByTalhao groups={groups} onShowAll={showAll} />
        </>
      ) : !data.items.length ? (
        <Box
          sx={{
            textAlign: "center",
            py: 7,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <Leaf size={40} />
          <Typography component="h2" variant="h5" mt={2}>
            {query
              ? "Nenhum resultado para esta busca"
              : "Seu primeiro registro começa com uma foto"}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {query
              ? "Experimente outro nome de doença."
              : "As análises ficam reunidas aqui para você consultar depois."}
          </Typography>
          {query ? (
            <Button onClick={() => setSearch("")}>Limpar busca</Button>
          ) : (
            <Button component={Link} to="/chat" variant="contained">
              Analisar uma folha
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Typography
            role="status"
            variant="body2"
            color="text.secondary"
            mb={2}
          >
            {data.total}{" "}
            {data.total === 1 ? "registro encontrado" : "registros encontrados"}
          </Typography>
          <AuxiliarNotice sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 1,
            }}
          >
            {data.items.map((d) => (
              <Card
                key={d.id}
                variant="outlined"
                sx={{ borderRadius: 1, boxShadow: "none" }}
              >
                <CardActionArea
                  component={Link}
                  to={"/historico/" + d.id}
                  sx={{ p: { xs: 1.5, md: 2 }, '&:hover': { bgcolor: 'surface.sunken' } }}
                >
                  <Stack direction="row" gap={2} alignItems="center" mb={2}>
                    {d.imageUrl ? (
                      <Box
                        component="img"
                        src={d.imageUrl}
                        alt="Foto da folha analisada"
                        sx={{
                          width: 72,
                          height: 80,
                          objectFit: "contain",
                          borderRadius: 2,
                          bgcolor: "background.default",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 72,
                          height: 80,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "background.default",
                          borderRadius: 2,
                        }}
                      >
                        <Leaf size={30} />
                      </Box>
                    )}
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(d.timestamp).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                      <Typography
                        component="h2"
                        variant="h6"
                        sx={{ lineHeight: 1.3 }}
                      >
                        {d.disease}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <MapPin size={13} aria-hidden="true" />
                        {d.talhaoNome || "Sem talhão"}
                      </Typography>
                    </Box>
                    <ArrowUpRight size={20} />
                  </Stack>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={d.modelUsed || "Modelo não informado"}
                  />
                  <Typography variant="body2" color="text.secondary" mt={1.5}>
                    Confiança do modelo:{" "}
                    {Number.isFinite(d.confidence)
                      ? (d.confidence * 100).toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        }) + "%"
                      : "não informada"}
                  </Typography>
                </CardActionArea>
                <Box sx={{ px: 2, pb: 1 }}>
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<Trash2 size={15} />}
                    aria-label={"Excluir registro de " + d.disease}
                    onClick={() => setRemoving(d)}
                  >
                    Excluir registro
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            mt={4}
          >
            <Pagination
              count={Math.ceil(data.total / 12)}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              getItemAriaLabel={(type, p) =>
                type === "page"
                  ? "Ir para página " + p
                  : type === "next"
                    ? "Próxima página"
                    : "Página anterior"
              }
            />
            <Button color="error" onClick={() => setRemoving("all")}>
              Limpar todo o histórico
            </Button>
          </Stack>
        </>
      )}
      <Dialog
        open={!!removing}
        onClose={() => {
          if (!busy) setRemoving(null);
        }}
        aria-labelledby="delete-title"
      >
        <DialogTitle id="delete-title">
          {removing === "all"
            ? "Excluir todo o histórico?"
            : "Excluir este registro?"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Esta ação não pode ser desfeita.{" "}
            {removing === "all"
              ? "Todos os registros da sua conta serão removidos, inclusive os que não aparecem nesta página."
              : "A análise será removida do histórico."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setRemoving(null)}>
            Manter registros
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy}
            onClick={remove}
          >
            {busy ? "Excluindo…" : "Confirmar exclusão"}
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
