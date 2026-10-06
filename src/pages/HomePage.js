import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { Camera, ChevronDown, ImageIcon, Mic, Plus, Sun } from "lucide-react";
import BrandLockup from "../components/Brand/BrandLockup";
import { useAuth } from "../hooks/useAuth";
import useFazendas from "../hooks/useFazendas";
import { getUsageSummary } from "../services/usageService";
import { getDiagnosesByTalhao } from "../services/historyService";
import {
  dueReminders,
  listReminders,
  REMINDERS_EVENT,
} from "../services/reminders";
import { setActiveTalhao } from "../services/activeTalhao";
import { riskOf } from "../utils/severity";
import { IMAGE_ACCEPT } from "../utils/imageUpload";
import cercospora from "../assets/field/cercospora.jpg";

// Animações do canvas (m-Home): entrada em cascata, varredura na mira e o
// pulso do "refotografar hoje".
const motion = {
  "@keyframes zpUp": {
    from: { opacity: 0, transform: "translateY(16px)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes zpScan": {
    "0%": { top: "8%" },
    "50%": { top: "88%" },
    "100%": { top: "8%" },
  },
  "@keyframes zpBlink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
  "@media (prefers-reduced-motion: reduce)": {
    "& *": { animation: "none !important" },
  },
};
const up = (i) => ({
  animation: `zpUp .6s ${i * 0.1}s cubic-bezier(.2,.7,.2,1) both`,
});

function saudacao(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function relativo(iso) {
  if (!iso) return "";
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `Há ${dias} dias`;
}

function QuotaPill() {
  const [usage, setUsage] = useState(null);
  useEffect(() => {
    let alive = true;
    getUsageSummary()
      .then((u) => alive && setUsage(u))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const inf = usage?.inference;
  if (!inf) return null;
  const ilimitado = inf.limit === null || inf.limit === undefined;
  return (
    <Box
      component={Link}
      to="/planos"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 999,
        px: 1.5,
        py: 1,
        textDecoration: "none",
        color: "text.primary",
        fontSize: "0.8125rem",
        fontWeight: 700,
        minHeight: 28,
      }}
    >
      <Box
        component="span"
        sx={{ fontFamily: (t) => t.typography.fontFamilyMono }}
      >
        {ilimitado ? "∞" : `${inf.used}/${inf.limit}`}
      </Box>
      <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
        análises hoje
      </Box>
    </Box>
  );
}

function CameraCard() {
  const navigate = useNavigate();
  const gallery = useRef(null);
  const pick = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (file) navigate("/chat", { state: { pendingFile: file, source: "gallery" } });
  };
  const dark = {
    bgcolor: "#14251B",
    color: "#EEF2E8",
    "&:hover": { bgcolor: "#1B3024" },
  };
  return (
    <Box
      sx={{
        bgcolor: "#0B1510",
        borderRadius: "24px",
        p: 2.25,
        color: "#EEF2E8",
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
      }}
    >
      <Stack direction="row" gap={1.75} alignItems="center">
        <Box
          sx={{
            position: "relative",
            width: 72,
            height: 72,
            flexShrink: 0,
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={cercospora}
            alt=""
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: "8px",
              border: "2px solid #C8F169",
              borderRadius: "8px",
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              left: 4,
              right: 4,
              height: 2,
              bgcolor: "#C8F169",
              boxShadow: "0 0 10px 2px rgba(200,241,105,.8)",
              animation: "zpScan 2.4s ease-in-out infinite",
            }}
          />
        </Box>
        <Typography
          sx={{ fontSize: "0.9375rem", lineHeight: 1.45, color: "#B7C2B4" }}
        >
          Folha inteira, de perto, com luz natural. Uma folha por foto rende o
          melhor laudo.
        </Typography>
      </Stack>
      <Box
        component={Link}
        to="/camera"
        sx={{
          height: 56,
          borderRadius: "16px",
          bgcolor: "cta.main",
          color: "cta.contrastText",
          fontWeight: 800,
          fontSize: "1.0625rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.25,
          textDecoration: "none",
          "&:hover": { bgcolor: "cta.hover" },
        }}
      >
        <Camera size={22} strokeWidth={2.2} aria-hidden="true" />
        Fotografar folha
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr)",
          gap: 1,
        }}
      >
        <input
          ref={gallery}
          type="file"
          accept={IMAGE_ACCEPT}
          hidden
          onChange={pick}
        />
        <Box
          component="button"
          type="button"
          onClick={() => gallery.current?.click()}
          sx={{
            height: 48,
            px: 2.5,
            border: 0,
            borderRadius: "14px",
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: "0.9375rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            cursor: "pointer",
            ...dark,
          }}
        >
          <ImageIcon size={18} aria-hidden="true" />
          Galeria
        </Box>
        <Box
          component={Link}
          to="/chat"
          state={{ startAudio: true }}
          sx={{
            height: 48,
            borderRadius: "14px",
            fontWeight: 700,
            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            textDecoration: "none",
            ...dark,
          }}
        >
          <Mic size={18} aria-hidden="true" />
          Perguntar por áudio
        </Box>
      </Box>
    </Box>
  );
}

function TalhaoCard({ group, due }) {
  const last = group.recent[0];
  const risk = last ? riskOf(last.severity) : null;
  const chooseTalhao = () =>
    setActiveTalhao({ id: group.talhaoId, nome: group.talhaoNome });
  return (
    <Box
      component={Link}
      to={last ? `/historico/${last.id}` : "/camera"}
      onClick={last ? undefined : chooseTalhao}
      sx={{
        flexShrink: 0,
        width: 200,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "18px",
        overflow: "hidden",
        textDecoration: "none",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
        scrollSnapAlign: "start",
      }}
    >
      {last?.imageUrl ? (
        <Box
          component="img"
          src={last.imageUrl}
          alt=""
          sx={{
            width: "100%",
            height: 64,
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Box sx={{ height: 64, bgcolor: "surface.muted" }} />
      )}
      <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1rem" }} noWrap>
          {group.talhaoNome}
        </Typography>
        {last ? (
          <Box
            component="span"
            sx={{
              alignSelf: "flex-start",
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
              bgcolor: risk.bg,
              color: risk.fg,
              fontWeight: 700,
              fontSize: "0.8125rem",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {last.severity === "nenhuma"
              ? risk.label
              : `${(last.disease || "").split(/[\s-]/)[0]} · ${risk.label.toLowerCase()}`}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum laudo ainda
          </Typography>
        )}
        <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
          {last ? relativo(last.timestamp) : "Toque para fotografar"}
          {due && (
            <>
              {" · "}
              <Box
                component="b"
                sx={{
                  color: "#8A1C12",
                  animation: "zpBlink 1.6s ease-in-out infinite",
                }}
              >
                refotografar hoje
              </Box>
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
}

function Talhoes({ fazenda }) {
  const [groups, setGroups] = useState(null);
  const [due, setDue] = useState(dueReminders);
  useEffect(() => {
    let alive = true;
    getDiagnosesByTalhao({ perGroup: 1 })
      .then((g) => alive && setGroups(g.filter((x) => x.talhaoId)))
      .catch(() => alive && setGroups([]));
    const sync = () => setDue(dueReminders());
    window.addEventListener(REMINDERS_EVENT, sync);
    return () => {
      alive = false;
      window.removeEventListener(REMINDERS_EVENT, sync);
    };
  }, []);
  const dueTalhoes = new Set(due.map((r) => r.talhaoId).filter(Boolean));
  // TCC-096: o Início mostra os talhões da fazenda ativa.
  const shown =
    groups && fazenda ? groups.filter((g) => g.fazendaId === fazenda.id || !g.fazendaId) : groups;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ mb: 1 }}
      >
        <Typography
          component="h2"
          sx={{ fontSize: "1.125rem", fontWeight: 800, fontStretch: "110%" }}
        >
          Seus talhões
        </Typography>
        <Box
          component={Link}
          to={fazenda ? `/fazendas/${fazenda.id}` : "/fazendas"}
          sx={{
            fontSize: "0.875rem",
            fontWeight: 700,
            py: 1,
            color: "primary.main",
            textDecoration: "none",
          }}
        >
          Ver todos
        </Box>
      </Stack>
      <Box
        sx={{
          display: "flex",
          gap: 1.25,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          mx: { xs: -2.5, md: 0 },
          px: { xs: 2.5, md: 0 },
          pb: 0.5,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {shown === null ? (
          [0, 1].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={200}
              height={170}
              sx={{ borderRadius: "18px", flexShrink: 0 }}
            />
          ))
        ) : shown.length ? (
          shown.map((g) => (
            <TalhaoCard
              key={g.talhaoId}
              group={g}
              due={dueTalhoes.has(g.talhaoId)}
            />
          ))
        ) : (
          <Box
            component={Link}
            to={fazenda ? `/fazendas/${fazenda.id}` : "/fazendas"}
            sx={{
              width: "100%",
              border: "1.5px dashed",
              borderColor: "divider",
              borderRadius: "18px",
              p: 2.5,
              display: "flex",
              gap: 1.25,
              alignItems: "center",
              color: "text.secondary",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <Plus size={18} aria-hidden="true" />
            Cadastre seu primeiro talhão para organizar os laudos por área.
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Lembrete() {
  const [next, setNext] = useState(() => listReminders()[0] || null);
  useEffect(() => {
    const sync = () => setNext(listReminders()[0] || null);
    window.addEventListener(REMINDERS_EVENT, sync);
    return () => window.removeEventListener(REMINDERS_EVENT, sync);
  }, []);
  if (!next) return null;
  const quando =
    new Date(next.dueAt) <= new Date()
      ? "hoje"
      : new Date(next.dueAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        });
  return (
    <Box
      component={Link}
      to={`/historico/${next.diagnosisId}`}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "18px",
        p: 1.75,
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        textDecoration: "none",
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "12px",
          bgcolor: "#FBF1C9",
          color: "#6B4A03",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Sun size={20} strokeWidth={2.2} aria-hidden="true" />
      </Box>
      <Typography sx={{ fontSize: "0.875rem", lineHeight: 1.4 }}>
        <b>Lembrete do Zé ({quando}):</b> voltar{" "}
        {next.talhaoNome ? `ao ${next.talhaoNome}` : "à lavoura"} e fotografar
        as mesmas plantas
        {next.disease
          ? ` para ver se a ${next.disease.toLowerCase()} avançou.`
          : "."}
      </Typography>
    </Box>
  );
}

/**
 * Início logado — m-Home do canvas: quota, a câmera em destaque, os talhões
 * com o último laudo de cada um e o lembrete do Zé. No desktop vira duas
 * colunas, com a câmera à esquerda.
 */
export default function HomePage() {
  const { user } = useAuth();
  const { active: fazenda } = useFazendas();
  const nome = (user?.full_name || "").trim().split(/\s+/)[0] || "produtor";
  return (
    <Box
      sx={{
        ...motion,
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 2.5, md: 4 },
        pt: { xs: 2, md: 5 },
        pb: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ display: { xs: "flex", md: "none" } }}
      >
        <BrandLockup size={32} />
        <QuotaPill />
      </Stack>
      <Box sx={{ pt: { xs: 2.5, md: 0 }, ...up(0) }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          gap={2}
        >
          <Box>
            {fazenda ? (
              <Box
                component={Link}
                to="/fazendas"
                aria-label={`${fazenda.nome}. Trocar de fazenda`}
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, minHeight: 28, fontSize: "0.9375rem", color: "text.secondary", textDecoration: "none" }}
              >
                {saudacao()} ·
                <Box component="b" sx={{ color: "primary.main" }}>{fazenda.nome}</Box>
                <ChevronDown size={14} strokeWidth={2.6} aria-hidden="true" />
              </Box>
            ) : (
              <Typography sx={{ fontSize: "0.9375rem", color: "text.secondary" }}>
                {saudacao()}, {nome}
              </Typography>
            )}
            <Typography
              component="h1"
              sx={{
                m: 0,
                mt: 0.25,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                fontWeight: 800,
                fontStretch: "112%",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              O que a lavoura tem hoje?
            </Typography>
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <QuotaPill />
          </Box>
        </Stack>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1fr) minmax(0, 1.2fr)",
          },
          gap: { xs: 2.75, md: 4 },
          mt: 2,
          alignItems: "start",
        }}
      >
        <Box sx={up(1)}>
          <CameraCard />
        </Box>
        <Stack gap={2} sx={up(2)}>
          <Talhoes fazenda={fazenda} />
          <Lembrete />
        </Stack>
      </Box>
    </Box>
  );
}
