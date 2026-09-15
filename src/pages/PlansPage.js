import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { Check } from "lucide-react";
import Page, { LoadingState, ErrorState } from "../components/common/Page";
import { useAuth } from "../hooks/useAuth";
import { listPlans } from "../services/subscriptionService";
import { demoPlan } from "../config/demoPlan";
import { IS_DEMO } from "../config/runtime";
const modelNames = {
  resnet50: "ResNet-50",
  efficientnet: "EfficientNet-B4",
  vit: "ViT-B/16",
  ensemble: "Ensemble",
};
export default function PlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    listPlans()
      .then((items) => {
        if (active) setPlans(items);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar os planos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version]);
  return (
    <Page
      eyebrow="Recursos por perfil"
      title="Um plano para cada nível de detalhe."
      description="Compare os recursos disponíveis no protótipo do Zé Praga."
    >
      <Alert severity="info" sx={{ mb: 4 }}>
        Demonstração acadêmica: ativação simulada, sem cobrança.
      </Alert>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            setError("");
            setVersion((v) => v + 1);
          }}
        />
      )}
      {loading ? (
        <LoadingState />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 3,
          }}
        >
          {plans.map((plan) => {
            const f =
                plan.features ||
                (IS_DEMO ? demoPlan(plan.name).features : null),
              current = (user?.plan?.name || "free") === plan.name;
            const lines = [
              plan.chat_daily_limit == null
                ? "Mensagens sem cota diária"
                : plan.chat_daily_limit + " mensagens por dia",
              plan.inference_daily_limit == null
                ? "Análises sem cota diária"
                : plan.inference_daily_limit + " análises por dia",
              ...(f
                ? [
                    (f.diagnosis_models || [])
                      .map((id) => modelNames[id] || id)
                      .join(", "),
                    "Orientações: " + (f.action_plan_levels || []).join(", "),
                    ...(f.export_diagnoses ? ["Exportação em PDF"] : []),
                    ...(f.api_access ? ["Acesso à API por chave"] : []),
                  ]
                : ["Recursos detalhados disponíveis após ativação"]),
            ];
            return (
              <Box
                key={plan.name}
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: current ? "primary.main" : "divider",
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="overline">Plano</Typography>
                  {current && (
                    <Chip size="small" label="Seu plano" color="primary" />
                  )}
                </Stack>
                <Typography component="h2" variant="h4" mt={1} mb={3}>
                  {plan.display_name || plan.name}
                </Typography>
                <Stack gap={2} mb={4} flex={1}>
                  {lines.map((line) => (
                    <Stack key={line} direction="row" gap={1}>
                      <Check size={19} style={{ flexShrink: 0 }} />
                      <Typography variant="body2">{line}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  component={Link}
                  to={"/planos/pagamento/" + plan.name}
                  variant={current ? "outlined" : "contained"}
                  disabled={current}
                >
                  {current ? "Plano atual" : "Experimentar este plano"}
                </Button>
              </Box>
            );
          })}
        </Box>
      )}
    </Page>
  );
}
