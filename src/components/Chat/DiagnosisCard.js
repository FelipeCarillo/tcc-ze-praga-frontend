import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Leaf } from "lucide-react";
import ActionPlan from "../Diagnosis/ActionPlan";
import { useActionPlan } from "../../hooks/useActionPlan";
import { IS_DEMO } from "../../config/runtime";
export default function DiagnosisCard({ diagnosis, onSave }) {
  const [expanded, setExpanded] = useState(false),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState("");
  const {
    actionPlan,
    loading,
    error: planError,
    retry,
  } = useActionPlan(diagnosis.diseaseId, expanded);
  const confidence = Number.isFinite(diagnosis.confidence)
    ? Math.max(0, Math.min(1, diagnosis.confidence)) * 100
    : null;
  return (
    <Box
      sx={{
        mt: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
        width: "100%",
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" gap={1} mb={2} flexWrap="wrap">
          <Chip
            size="small"
            icon={<Leaf size={15} />}
            label={IS_DEMO ? "Resultado simulado" : "Hipótese da análise"}
            variant="outlined"
          />
          <Chip
            size="small"
            label={diagnosis.modelUsed || "Modelo não informado"}
            variant="outlined"
          />
        </Stack>
        <Typography component="h2" variant="h5" sx={{ mb: 0.5 }}>
          {diagnosis.disease}
        </Typography>
        <Typography color="text.secondary" fontStyle="italic" variant="body2">
          {diagnosis.scientificName}
        </Typography>
        {confidence !== null && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Confiança do modelo</Typography>
              <Typography fontWeight={700}>
                {confidence.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
                %
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={confidence}
              aria-label="Confiança do modelo"
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography
              color="text.secondary"
              variant="caption"
              display="block"
              mt={1}
            >
              Este valor expressa a saída do modelo. Não é a probabilidade de um
              diagnóstico confirmado em campo.
            </Typography>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Compare os sinais com a lavoura e procure orientação agronômica antes
          de decidir o manejo.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
        <Stack gap={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => setExpanded((v) => !v)}
            endIcon={<ChevronDown size={18} />}
            aria-expanded={expanded}
          >
            {expanded ? "Recolher orientações" : "Ver próximos cuidados"}
          </Button>
          {diagnosis.id && (
            <Button
              component={Link}
              to={"/historico/" + diagnosis.id}
              endIcon={<ArrowRight size={17} />}
            >
              Abrir resultado completo
            </Button>
          )}
          {onSave && (
            <Button
              disabled={saving || saved}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave(diagnosis);
                  setSaved(true);
                } catch {
                  setError(
                    "Não foi possível guardar o resultado. Tente novamente.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saved
                ? "Resultado guardado"
                : saving
                  ? "Guardando…"
                  : "Guardar no histórico"}
            </Button>
          )}
        </Stack>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
          {loading ? (
            <Typography role="status">Buscando orientações…</Typography>
          ) : planError ? (
            <Alert
              severity="error"
              action={<Button onClick={retry}>Tentar novamente</Button>}
            >
              Não foi possível carregar as orientações.
            </Alert>
          ) : actionPlan ? (
            <ActionPlan actions={actionPlan} />
          ) : (
            <Alert severity="info">
              Ainda não há orientações cadastradas para esta hipótese.
            </Alert>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
