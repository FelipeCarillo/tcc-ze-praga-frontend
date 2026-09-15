import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowLeft, Camera, Download, Leaf } from "lucide-react";
import Page, { LoadingState, ErrorState } from "../components/common/Page";
import ActionPlan from "../components/Diagnosis/ActionPlan";
import { getDiagnosisById } from "../services/historyService";
import { useActionPlan } from "../hooks/useActionPlan";
import { useFeatures } from "../contexts/FeaturesContext";
import { IS_DEMO } from "../config/runtime";
export default function DiagnosisDetailPage() {
  const { id } = useParams(),
    features = useFeatures();
  const [result, setResult] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [exporting, setExporting] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setResult(null);
    setError("");
    getDiagnosisById(id)
      .then((d) => {
        if (active) {
          setResult(d);
          if (!d) setError("Este registro não foi encontrado.");
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Não foi possível abrir este registro. Ele pode ter sido removido.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, version]);
  const {
    actionPlan,
    loading: planLoading,
    error: planError,
    retry,
  } = useActionPlan(result?.diseaseId);
  const exportPdf = async () => {
    setExporting(true);
    try {
      const { exportDiagnosisPdf } = await import("../services/pdfExport");
      await exportDiagnosisPdf({ ...result, actionPlan });
    } catch {
      setError("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };
  return (
    <Page
      eyebrow="Registro da análise"
      title={result?.disease || "Resultado da folha"}
      description={
        result ? new Date(result.timestamp).toLocaleString("pt-BR") : ""
      }
      actions={
        <Button
          component={Link}
          to="/historico"
          startIcon={<ArrowLeft size={18} />}
        >
          Histórico
        </Button>
      }
    >
      {error && (
        <Box mb={2}>
          <ErrorState
            message={error}
            onRetry={() => setVersion((v) => v + 1)}
          />
        </Box>
      )}
      {loading ? (
        <LoadingState label="Abrindo sua análise…" />
      ) : (
        result && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: ".85fr 1.15fr" },
              gap: 4,
              alignItems: "start",
            }}
          >
            <Box sx={{ order: { xs: 2, md: 1 } }}>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 4,
                  overflow: "hidden",
                  p: 2,
                }}
              >
                {result.imageUrl ? (
                  <Box
                    component="img"
                    src={result.imageUrl}
                    alt="Foto original da folha analisada"
                    sx={{
                      width: "100%",
                      height: { xs: 280, md: 390 },
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Box
                    sx={{ height: 200, display: "grid", placeItems: "center" }}
                  >
                    <Leaf size={70} />
                    <Typography color="text.secondary">
                      Foto indisponível
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary">
                  Foto enviada · {result.imageName || "sem nome"}
                </Typography>
              </Box>
              <Stack direction="row" gap={1} mt={2} flexWrap="wrap">
                <Chip
                  variant="outlined"
                  label={result.modelUsed || "Modelo não informado"}
                />
                {IS_DEMO && <Chip label="Resultado simulado" color="warning" />}
              </Stack>
              <Typography component="h2" variant="h6" mt={3} mb={1}>
                Sobre esta doença
              </Typography>
              <Typography color="text.secondary">
                {result.description || "Não há descrição cadastrada."}
              </Typography>
              <Alert severity="info" sx={{ mt: 3 }}>
                A análise é uma hipótese baseada na imagem. A severidade da
                lesão não é medida por este sistema. Confirme o contexto com um
                profissional de agronomia.
              </Alert>
            </Box>
            <Box sx={{ order: { xs: 1, md: 2 } }}>
              <Typography variant="overline" color="primary.main">
                HIPÓTESE DO MODELO
              </Typography>
              <Typography variant="h4" component="h2" mb={0.5}>
                {result.disease}
              </Typography>
              <Typography color="text.secondary" fontStyle="italic" mb={3}>
                {result.scientificName}
              </Typography>
              <Typography fontWeight={700} mb={1}>
                Confiança:{" "}
                {Number.isFinite(result.confidence)
                  ? (result.confidence * 100).toLocaleString("pt-BR", {
                      maximumFractionDigits: 1,
                    }) + "%"
                  : "não informada"}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.max(
                  0,
                  Math.min(100, (result.confidence || 0) * 100),
                )}
                aria-label="Confiança do modelo"
                sx={{ height: 7, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" mt={1} mb={3}>
                A pontuação do modelo não garante acerto em condições de campo.
              </Typography>
              {planLoading ? (
                <LoadingState label="Buscando próximos cuidados…" />
              ) : planError ? (
                <ErrorState
                  message="As orientações não carregaram."
                  onRetry={retry}
                />
              ) : actionPlan ? (
                <ActionPlan key={result.diseaseId} actions={actionPlan} />
              ) : (
                <Alert severity="info">
                  Ainda não há plano de ação cadastrado para esta hipótese.
                </Alert>
              )}
              {!!result.top3?.length && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  <Typography component="h2" variant="h6" mb={1}>
                    Outras saídas do modelo
                  </Typography>
                  {result.top3.slice(1).map((d, i) => (
                    <Stack
                      key={d.diseaseId || i}
                      direction="row"
                      justifyContent="space-between"
                      gap={2}
                      py={1}
                    >
                      <Typography variant="body2">{d.disease}</Typography>
                      <Typography variant="body2">
                        {(d.confidence * 100).toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })}
                        %
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              )}
              <Stack gap={1} mt={3}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/chat"
                  startIcon={<Camera size={19} />}
                >
                  Analisar outra folha
                </Button>
                <Button
                  startIcon={<Download size={18} />}
                  disabled={
                    !features?.export_diagnoses ||
                    exporting ||
                    planLoading ||
                    !!planError
                  }
                  onClick={exportPdf}
                >
                  {exporting
                    ? "Preparando PDF…"
                    : "Exportar este registro em PDF"}
                </Button>
                {!features?.export_diagnoses && (
                  <Typography variant="caption" color="text.secondary">
                    Exportação disponível nos planos Pro e Enterprise.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        )
      )}
    </Page>
  );
}
