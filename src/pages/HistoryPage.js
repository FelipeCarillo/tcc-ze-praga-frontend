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
  Typography,
} from "@mui/material";
import { ArrowUpRight, Camera, Download, Leaf, Trash2 } from "lucide-react";
import Page, { LoadingState, ErrorState } from "../components/common/Page";
import {
  getDiagnosesPage,
  getDiagnoses,
  deleteDiagnosis,
  clearAllDiagnoses,
} from "../services/historyService";
import { useFeatures } from "../contexts/FeaturesContext";
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
    [exporting, setExporting] = useState(false);
  const features = useFeatures();
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
    getDiagnosesPage({ page, limit: 12, search: query })
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
  }, [page, query, version]);
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
      const all = await getDiagnoses({ search: query });
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
      description="Reveja suas análises e acompanhe os registros da sua lavoura."
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
        <TextField
          label="Buscar doença"
          placeholder="Ex.: ferrugem"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2,1fr)",
                lg: "repeat(3,1fr)",
              },
              gap: 2,
            }}
          >
            {data.items.map((d) => (
              <Card
                key={d.id}
                variant="outlined"
                sx={{ borderRadius: 4, boxShadow: "none" }}
              >
                <CardActionArea
                  component={Link}
                  to={"/historico/" + d.id}
                  sx={{ p: 2.5 }}
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
