import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowRight, Camera } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { IS_DEMO } from "../config/runtime";
import { DATASET, MODELS } from "../data/modelMetrics";
import AuxiliarNotice from "../components/common/AuxiliarNotice";
import lavoura from "../assets/field/lavoura-rs.jpg";
import ferrugem from "../assets/field/ferrugem-macro.jpg";
import cercospora from "../assets/field/cercospora.jpg";
import produtor from "../assets/field/produtor.jpg";

// Rebrand 2026 — landing baseada no canvas de design aprovado: lavoura em tela
// cheia, mira com varredura, faixa com as 6 condições e números abertos.

const CONDITIONS = [
  "Ferrugem-asiática",
  "Cercosporiose",
  "Mancha-alvo",
  "Mancha-olho-de-rã",
  "Míldio",
  "Folha saudável",
];

const STEPS = [
  {
    img: cercospora,
    alt: "Folhas de soja na lavoura",
    title: "Fotografa a folha",
    text: "Folha inteira, de perto, luz natural. Pode mandar mais de uma foto do mesmo talhão.",
  },
  {
    img: ferrugem,
    alt: "Close de pústulas de ferrugem-asiática",
    title: "O Zé analisa",
    text: "Redes neurais treinadas em fotos de soja apontam a hipótese, e o Zé explica na conversa.",
  },
  {
    img: produtor,
    alt: "Produtor em lavoura de soja",
    title: "Você decide com o agrônomo",
    text: "Plano de ação em camadas, histórico por talhão e laudo para levar ao seu engenheiro-agrônomo.",
    position: "70% 30%",
  },
];

const PLAN_BY_MODEL = {
  ensemble: "Enterprise",
  efficientnet_b4: "Pro",
  vit_b16: "Pro",
  resnet50: "Gratuito",
};

const pct = (v) =>
  `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const motionSx = {
  "@keyframes zpUp": {
    from: { opacity: 0, transform: "translateY(18px)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes zpKen": {
    from: { transform: "scale(1.03)" },
    to: { transform: "scale(1.14) translate(-2%, -1%)" },
  },
  "@keyframes zpScan": {
    "0%": { top: "4%" },
    "50%": { top: "94%" },
    "100%": { top: "4%" },
  },
  "@keyframes zpFloat": {
    "0%, 100%": { transform: "translateY(0) rotate(2deg)" },
    "50%": { transform: "translateY(-10px) rotate(1deg)" },
  },
  "@keyframes zpPop": {
    "0%": { opacity: 0, transform: "scale(.6)" },
    "70%": { opacity: 1, transform: "scale(1.05)" },
    "100%": { opacity: 1, transform: "scale(1)" },
  },
  "@keyframes zpMarq": {
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(-50%)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& *": { animation: "none !important" },
  },
};

const up = (delay = 0) => ({
  animation: `zpUp .8s ${delay}s cubic-bezier(.2,.7,.2,1) both`,
});

function Corner({ pos }) {
  const v = pos.includes("t") ? { top: 16 } : { bottom: 16 };
  const h = pos.includes("l") ? { left: 16 } : { right: 16 };
  const side = (s) => `4px solid ${s ? "#C8F169" : "transparent"}`;
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        ...v,
        ...h,
        width: 34,
        height: 34,
        borderTop: side(pos.includes("t")),
        borderBottom: side(pos.includes("b")),
        borderLeft: side(pos.includes("l")),
        borderRight: side(pos.includes("r")),
        borderRadius: "10px",
      }}
    />
  );
}

function ScanCard() {
  return (
    <Box sx={{ position: "relative", height: { xs: 340, md: 440 }, width: "100%", maxWidth: 380, mx: "auto" }}>
      <Box
        sx={{
          position: "absolute",
          inset: { xs: "0 16px 56px 16px", md: "0 20px 48px 20px" },
          borderRadius: "28px",
          overflow: "hidden",
          border: "5px solid #FFFFFF",
          boxShadow: "0 30px 60px rgba(0,0,0,.4)",
          animation: "zpFloat 7s ease-in-out infinite",
        }}
      >
        <Box
          component="img"
          src={ferrugem}
          alt="Folha de soja com pústulas de ferrugem-asiática"
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {["tl", "tr", "bl", "br"].map((p) => (
          <Corner key={p} pos={p} />
        ))}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: 10,
            right: 10,
            height: 2,
            bgcolor: "#C8F169",
            boxShadow: "0 0 16px 3px rgba(200,241,105,.85)",
            animation: "zpScan 3s ease-in-out infinite",
          }}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "#FFFFFF",
          color: "#0F1A13",
          borderRadius: "20px",
          p: 2,
          boxShadow: "0 16px 36px rgba(0,0,0,.3)",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          animation: "zpPop .6s 1.6s cubic-bezier(.2,.7,.2,1) both",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 800, fontStretch: "110%", fontSize: "1.125rem" }}>
            Ferrugem-asiática
          </Typography>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontWeight: 600 }}>
            exemplo
          </Typography>
        </Stack>
        <AuxiliarNotice compact />
      </Box>
    </Box>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const models = [...MODELS].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <Box sx={motionSx}>
      <Box
        component="section"
        sx={{ position: "relative", overflow: "hidden", bgcolor: "#0B1510", color: "#FFFFFF" }}
      >
        <Box
          component="img"
          src={lavoura}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            animation: "zpKen 22s ease-in-out infinite alternate",
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            background: {
              xs: "linear-gradient(180deg, rgba(11,21,16,.55) 0%, rgba(11,21,16,.92) 60%)",
              md: "linear-gradient(90deg, rgba(11,21,16,.92) 0%, rgba(11,21,16,.6) 45%, rgba(11,21,16,.1) 100%)",
            },
          }}
        />
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            py: { xs: 5, md: 12 },
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          <Stack spacing={3} sx={{ flex: "1 1 480px", minWidth: 0 }}>
            <Typography
              sx={{
                ...up(0),
                fontFamily: (t) => t.typography.fontFamilyMono,
                fontSize: "0.875rem",
                letterSpacing: ".08em",
                color: "#C8F169",
              }}
            >
              SEU AGRÔNOMO DE BOLSO
            </Typography>
            <Typography
              component="h1"
              variant="h1"
              sx={{ ...up(0.15), color: "#FFFFFF", fontSize: { xs: "2.4rem", sm: "3rem", md: "4.5rem" }, lineHeight: 0.98 }}
            >
              Manda a foto da folha. O Zé diz o que é e o que fazer.
            </Typography>
            <Typography sx={{ ...up(0.3), color: "#D6E4D3", fontSize: { xs: "1.0625rem", md: "1.1875rem" }, lineHeight: 1.55, maxWidth: 560 }}>
              Diagnóstico de doenças foliares da soja por foto, plano de ação em português e histórico por talhão.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={up(0.45)}>
              <Button
                component={Link}
                to="/chat"
                size="large"
                startIcon={<Camera size={22} />}
                sx={{
                  bgcolor: "cta.main",
                  color: "cta.contrastText",
                  fontWeight: 800,
                  minHeight: 56,
                  px: 3.5,
                  "&:hover": { bgcolor: "cta.hover" },
                }}
              >
                Analisar uma folha
              </Button>
              <Button
                component={Link}
                to={user ? "/historico" : "/sobre"}
                size="large"
                variant="outlined"
                endIcon={<ArrowRight size={18} />}
                sx={{ minHeight: 56, color: "#EEF2E8", borderColor: "rgba(238,242,232,.7)", "&:hover": { borderColor: "#EEF2E8", bgcolor: "rgba(238,242,232,.08)" } }}
              >
                {user ? "Abrir meu histórico" : "Conhecer o projeto"}
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ color: "#B7C2B4", ...up(0.6) }}>
              {IS_DEMO
                ? "Demonstração local: respostas e análises simuladas são identificadas."
                : "Entre na sua conta para analisar e guardar seus laudos."}
            </Typography>
          </Stack>
          <Box sx={{ flex: "0 1 380px", width: "100%" }}>
            <ScanCard />
          </Box>
        </Container>
      </Box>

      <Box
        aria-label="Condições reconhecidas"
        sx={{ bgcolor: "cta.main", color: "cta.contrastText", overflow: "hidden", py: 1.75, whiteSpace: "nowrap" }}
      >
        <Box sx={{ display: "flex", gap: 6, width: "max-content", animation: "zpMarq 30s linear infinite" }}>
          {[...CONDITIONS, ...CONDITIONS].map((c, i) => (
            <Typography
              key={`${c}-${i}`}
              aria-hidden={i >= CONDITIONS.length ? "true" : undefined}
              sx={{ fontWeight: 800, fontStretch: "112%", fontSize: "1.125rem", textTransform: "uppercase" }}
            >
              {c} ·
            </Typography>
          ))}
        </Box>
      </Box>

      <Container maxWidth="lg" component="section" id="como" sx={{ py: { xs: 7, md: 12 } }}>
        <Typography component="h2" variant="h2" sx={{ mb: { xs: 3, md: 5 } }}>
          Três passos, no meio da lavoura
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2.5 }}>
          {STEPS.map((s, i) => (
            <Box
              key={s.title}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "24px",
                overflow: "hidden",
                transition: "transform .25s ease, box-shadow .25s ease",
                "&:hover": { transform: "translateY(-6px)", boxShadow: "0 18px 36px rgba(15,26,19,.14)" },
                "&:hover img": { transform: "scale(1.06)" },
              }}
            >
              <Box sx={{ height: 200, overflow: "hidden" }}>
                <Box
                  component="img"
                  src={s.img}
                  alt={s.alt}
                  loading="lazy"
                  sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: s.position || "center", transition: "transform .6s ease", display: "block" }}
                />
              </Box>
              <Box sx={{ p: 2.75 }}>
                <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, color: "primary.main", fontWeight: 600 }}>
                  {String(i + 1).padStart(2, "0")}
                </Typography>
                <Typography component="h3" variant="h4" sx={{ mt: 0.5, fontSize: "1.375rem" }}>
                  {s.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {s.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>

      <Container maxWidth="lg" component="section" id="modelos" sx={{ pb: { xs: 7, md: 12 } }}>
        <Box
          sx={{
            bgcolor: "#0B1510",
            color: "#EEF2E8",
            borderRadius: "28px",
            p: { xs: 3, md: 5 },
            display: "flex",
            gap: { xs: 3, md: 5 },
            flexWrap: "wrap",
          }}
        >
          <Stack spacing={1.5} sx={{ flex: "1 1 300px" }}>
            <Typography component="h2" variant="h3" sx={{ color: "#FFFFFF" }}>
              Números abertos, testados em {DATASET.split.test.toLocaleString("pt-BR")} fotos
            </Typography>
            <Typography sx={{ color: "#B7C2B4" }}>
              Dataset {DATASET.name}, {DATASET.classes} classes, separação {DATASET.split.ratio}. Mesmo com esses números, o Zé dá uma hipótese, não um laudo oficial.
            </Typography>
            <Box>
              <Button component={Link} to="/modelos" endIcon={<ArrowRight size={18} />} sx={{ color: "#C8F169", px: 0 }}>
                Ver método e limites
              </Button>
            </Box>
          </Stack>
          <Box sx={{ flex: "1 1 480px", overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9375rem" }}>
              <thead>
                <Box component="tr" sx={{ textAlign: "left", color: "#8A9B86", fontSize: "0.8125rem" }}>
                  {["Modelo", "Acurácia", "F1-macro", "Plano"].map((h) => (
                    <Box component="th" key={h} sx={{ py: 1.25, px: 1, fontWeight: 600 }}>
                      {h}
                    </Box>
                  ))}
                </Box>
              </thead>
              <tbody>
                {models.map((m) => (
                  <Box
                    component="tr"
                    key={m.id}
                    sx={{ borderTop: "1px solid #22362A", color: m.prod ? "#C8F169" : "inherit" }}
                  >
                    <Box component="td" sx={{ py: 1.5, px: 1, fontWeight: m.prod ? 800 : 500 }}>
                      {m.name}
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 1, fontFamily: (t) => t.typography.fontFamilyMono }}>
                      {pct(m.accuracy)}
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 1, fontFamily: (t) => t.typography.fontFamilyMono }}>
                      {pct(m.f1)}
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 1 }}>
                      {PLAN_BY_MODEL[m.id] || "—"}
                    </Box>
                  </Box>
                ))}
              </tbody>
            </Box>
          </Box>
        </Box>
        <AuxiliarNotice sx={{ mt: 3 }} />
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
          Fotos: Wikimedia Commons — L. Kibisz (CC BY-SA 4.0), FDACS-DPI (CC BY 3.0 US), F. Sautua (CC BY-SA 4.0), United Soybean Board (CC BY 2.0).
        </Typography>
      </Container>
    </Box>
  );
}
