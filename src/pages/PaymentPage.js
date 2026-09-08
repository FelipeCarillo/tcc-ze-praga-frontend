import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import Page, { LoadingState, ErrorState } from "../components/common/Page";
import { useAuth } from "../hooks/useAuth";
import {
  listPlans,
  subscribeToPlan,
  usageFromPlan,
} from "../services/subscriptionService";
import { getSession } from "../services/authService";
import { IS_DEMO } from "../config/runtime";
import { demoPlan } from "../config/demoPlan";
export default function PaymentPage() {
  const { planName } = useParams(),
    { user, syncUser } = useAuth();
  const [plan, setPlan] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false);
  useEffect(() => {
    let active = true;
    listPlans()
      .then((items) => {
        if (active) {
          const found = items.find((p) => p.name === planName);
          setPlan(found);
          if (!found) setError("Plano não encontrado.");
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar o plano.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [planName]);
  const activate = async () => {
    setBusy(true);
    setError("");
    try {
      const subscription = await subscribeToPlan(plan.name);
      if (IS_DEMO)
        syncUser({
          ...user,
          subscription,
          plan: demoPlan(plan.name),
          usage: usageFromPlan(subscription.plan),
        });
      else {
        const session = await getSession();
        syncUser(session.user);
      }
      window.dispatchEvent(new CustomEvent("quota-updated"));
      setSuccess(true);
    } catch {
      setError(
        "Não foi possível confirmar a ativação. Confira seu perfil antes de tentar novamente.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page
      eyebrow="Planos do protótipo"
      title={
        success
          ? "Plano ativado"
          : "Experimentar " + (plan?.display_name || "um plano")
      }
      description="Demonstração acadêmica dos níveis de acesso."
    >
      <Box
        sx={{
          maxWidth: 650,
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
        }}
      >
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <Alert severity={success ? "success" : "info"} sx={{ mb: 3 }}>
              {success
                ? "Os recursos do seu perfil foram atualizados."
                : "A ativação é simulada, sem cobrança. Nenhum dado de cartão, CPF ou pagamento é necessário."}
            </Alert>
            {error && <ErrorState message={error} />}
            {plan && !success && (
              <>
                <Typography mb={3}>
                  Ao continuar, seu perfil passa a usar os limites e os recursos
                  do plano {plan.display_name}. Você poderá trocar o plano nesta
                  demonstração.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={busy}
                  onClick={activate}
                >
                  {busy ? "Ativando…" : "Ativar plano de demonstração"}
                </Button>
              </>
            )}
            <Stack direction="row" gap={2} mt={2}>
              <Button component={Link} to="/planos">
                Ver planos
              </Button>
              <Button component={Link} to={success ? "/chat" : "/perfil"}>
                {success ? "Começar análise" : "Meu perfil"}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Page>
  );
}
