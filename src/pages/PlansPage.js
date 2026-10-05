import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { Check } from "lucide-react";
import { ErrorState } from "../components/common/Page";
import { useAuth } from "../hooks/useAuth";
import { listPlans } from "../services/subscriptionService";
import { demoPlan } from "../config/demoPlan";
import { IS_DEMO } from "../config/runtime";
import produtor from "../assets/field/produtor.jpg";

const modelNames = {
  resnet50: "ResNet-50",
  efficientnet: "EfficientNet-B4",
  vit: "ViT-B/16",
  ensemble: "Ensemble",
};
const levelNames = { essencial: "essencial", campo: "no campo", especialista: "especialista" };
// Para quem cada plano é (m-Planos).
const audience = {
  free: "Para conhecer o Zé",
  pro: "Produtor que monitora toda semana",
  enterprise: "Consultoria, revenda e cooperativa",
};

function joinPt(list) {
  if (list.length <= 1) return list.join("");
  return list.slice(0, -1).join(", ") + " e " + list[list.length - 1];
}

/** O que o plano traz, a partir dos dados do plano (nada inventado). */
export function planFeatures(plan) {
  const f = plan.features || (IS_DEMO ? demoPlan(plan.name).features : null);
  const models = (f?.diagnosis_models || []).map((id) => modelNames[id] || id);
  const levels = (f?.action_plan_levels || []).map((l) => levelNames[l] || l);
  return [
    plan.inference_daily_limit == null ? "Análises de foto sem limite diário" : `${plan.inference_daily_limit} análises de foto por dia`,
    plan.chat_daily_limit == null ? "Conversa com o Zé sem limite diário" : `${plan.chat_daily_limit} mensagens com o Zé por dia`,
    ...(models.length ? [models.length === 1 ? `Modelo ${models[0]}` : `Modelos ${joinPt(models)}`] : []),
    ...(levels.length ? [`Plano de ação: ${joinPt(levels)}`] : []),
    "Histórico por talhão",
    ...(f?.export_diagnoses ? ["Exportar laudos em PDF"] : []),
    ...(f?.api_access ? ["Acesso à API por chave"] : []),
  ];
}

/**
 * Planos — m-Planos do canvas: foto do produtor, os planos como opções de
 * rádio, o que o escolhido traz e o botão de ação. Os planos são de
 * demonstração acadêmica (ativação simulada, sem cobrança): não há preço no
 * backend, então nenhum valor é inventado.
 */
export default function PlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState(null);
  const currentName = user?.plan?.name || "free";

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPlans()
      .then((items) => {
        if (!active) return;
        setPlans(items);
        setSelected((s) => s || items.find((p) => p.name === "pro")?.name || items[0]?.name || null);
      })
      .catch(() => active && setError("Não foi possível carregar os planos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [version]);

  const plan = useMemo(() => plans.find((p) => p.name === selected), [plans, selected]);
  const isCurrent = plan && plan.name === currentName;

  return (
    <Box
      sx={{
        "@keyframes zpUp": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        "@keyframes zpKen": { from: { transform: "scale(1.05)" }, to: { transform: "scale(1.15) translate(2%, -1%)" } },
        "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
      }}
    >
      <Box sx={{ position: "relative", height: { xs: 170, md: 260 }, overflow: "hidden", bgcolor: "#0B1510", color: "#FFFFFF" }}>
        <Box component="img" src={produtor} alt="Produtor em lavoura de soja madura" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "70% 30%", animation: "zpKen 16s ease-in-out infinite alternate" }} />
        <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,21,16,.85) 0%, rgba(11,21,16,.3) 70%)" }} />
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, maxWidth: 720, mx: "auto", px: { xs: 2.5, md: 4 }, pb: { xs: 2.5, md: 4 } }}>
          <Typography component="h1" sx={{ m: 0, maxWidth: { xs: 230, md: 520 }, color: "#FFFFFF", fontSize: { xs: "1.75rem", md: "2.75rem" }, fontWeight: 800, fontStretch: "112%", letterSpacing: "-0.02em", lineHeight: 1.02 }}>
            Do talhão à fazenda inteira
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2.5, md: 4 }, pt: 2, pb: 4, display: "flex", flexDirection: "column", gap: 1.75 }}>
        <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
          Demonstração acadêmica: a ativação é simulada e não há cobrança.
        </Typography>
        {error && <ErrorState message={error} onRetry={() => { setError(""); setVersion((v) => v + 1); }} />}

        <Box role="radiogroup" aria-label="Planos" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {loading
            ? [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: "16px" }} />)
            : plans.map((p) => {
                const on = p.name === selected;
                const current = p.name === currentName;
                return (
                  <Box
                    key={p.name}
                    component="button"
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSelected(p.name)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      width: "100%",
                      minHeight: 64,
                      px: 1.75,
                      py: 1.25,
                      borderRadius: "16px",
                      fontFamily: "inherit",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "text.primary",
                      bgcolor: "background.paper",
                      border: on ? "2px solid" : "1px solid",
                      borderColor: on ? "primary.main" : "divider",
                      boxShadow: on ? "0 6px 18px rgba(27,77,46,.12)" : "none",
                      transition: "box-shadow .2s, border-color .2s",
                    }}
                  >
                    <Box
                      component="span"
                      aria-hidden="true"
                      sx={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, boxSizing: "border-box", border: on ? "6px solid" : "2px solid", borderColor: on ? "primary.main" : "#8A9B86", bgcolor: on ? "#C8F169" : "transparent" }}
                    />
                    <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 800, fontSize: "1.0625rem" }}>
                        {p.display_name || p.name}
                        {current && (
                          <Box component="span" sx={{ fontSize: "0.6875rem", fontWeight: 700, bgcolor: "surface.muted", borderRadius: 999, px: 1, py: 0.25 }}>
                            seu plano
                          </Box>
                        )}
                      </Box>
                      <Box component="span" sx={{ display: "block", fontSize: "0.8125rem", color: "text.secondary", fontWeight: 500 }}>
                        {audience[p.name] || ""}
                      </Box>
                    </Box>
                    <Box component="span" sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontWeight: 600, fontSize: "0.875rem", color: p.name === "free" ? "text.primary" : "text.secondary" }}>
                      {p.name === "free" ? "R$ 0" : "demo"}
                    </Box>
                  </Box>
                );
              })}
        </Box>

        {plan && (
          <Box key={plan.name} sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "18px", px: 2, py: 1.75, display: "flex", flexDirection: "column", gap: 1.1, animation: "zpUp .45s cubic-bezier(.2,.7,.2,1) both" }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.secondary" }}>
              No {plan.display_name || plan.name} você tem
            </Typography>
            {planFeatures(plan).map((t) => (
              <Stack key={t} direction="row" gap={1.25} alignItems="flex-start" sx={{ fontSize: "0.9375rem", lineHeight: 1.35 }}>
                <Box sx={{ color: "primary.main", display: "flex", mt: "1px" }}>
                  <Check size={18} strokeWidth={2.8} aria-hidden="true" />
                </Box>
                <span>{t}</span>
              </Stack>
            ))}
          </Box>
        )}

        {plan && (
          <Box
            component={isCurrent ? "span" : Link}
            to={isCurrent ? undefined : user ? "/planos/pagamento/" + plan.name : "/login"}
            state={!isCurrent && !user ? { from: "/planos" } : undefined}
            aria-disabled={isCurrent || undefined}
            sx={{
              height: 56,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.0625rem",
              textDecoration: "none",
              bgcolor: isCurrent ? "surface.muted" : "cta.main",
              color: isCurrent ? "text.secondary" : "cta.contrastText",
              "&:hover": { bgcolor: isCurrent ? "surface.muted" : "cta.hover" },
            }}
          >
            {isCurrent ? "Seu plano atual" : plan.name === "enterprise" ? "Experimentar o Enterprise" : `Assinar o ${plan.display_name || plan.name}`}
          </Box>
        )}
      </Box>
    </Box>
  );
}
