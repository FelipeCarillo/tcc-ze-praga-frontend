import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { ArrowRight, Camera, CheckCircle2, Leaf } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { IS_DEMO } from "../config/runtime";
import soybeanRust from "../assets/soybean-rust.jpg";

const captureNotes = [
  ["Aproxime", "Uma folha por vez, em foco e com as manchas visíveis."],
  ["Use luz natural", "Evite filtros e reflexos que escondam a textura."],
  ["Confira antes", "Você revisa a imagem e decide quando enviar."],
];

function AnimatedFieldPhoto() {
  return (
    <Box
      role="img"
      aria-label="Foto de referência visual com folhas de soja apresentando sinais visíveis"
      sx={{
        minHeight: { xs: 300, md: 460 },
        overflow: "hidden",
        position: "relative",
        borderRadius: { xs: 3, md: 4 },
        bgcolor: "#123e2b",
        "@keyframes field-photo-drift": {
          from: { transform: "scale(1.02) translate3d(-1%, -1%, 0)" },
          to: { transform: "scale(1.14) translate3d(2%, 1%, 0)" },
        },
        "@keyframes field-photo-light": {
          from: { transform: "translateX(-130%) skewX(-16deg)", opacity: 0 },
          "35%": { opacity: 0.22 },
          to: { transform: "translateX(360%) skewX(-16deg)", opacity: 0 },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& *, &::after": { animation: "none !important" },
        },
      }}
    >
      <Box
        component="img"
        src={soybeanRust}
        alt="Folhas de soja com sinais visíveis observadas no campo"
        sx={{
          width: "100%",
          height: "100%",
          inset: 0,
          position: "absolute",
          display: "block",
          objectFit: "cover",
          objectPosition: "center",
          animation: "field-photo-drift 16s ease-in-out infinite alternate",
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7,28,17,.48), transparent 46%, rgba(7,28,17,.58))",
          "&::after": {
            content: '\"\"',
            position: "absolute",
            inset: "-20% auto -20% 0",
            width: "23%",
            background:
              "linear-gradient(90deg, transparent, rgba(240,237,226,.72), transparent)",
            animation: "field-photo-light 9s ease-in-out infinite",
          },
        }}
      />
      <Box sx={{ position: "absolute", top: 24, left: 24 }}>
        <Typography
          component="span"
          sx={{
            bgcolor: "rgba(15,27,20,.78)",
            color: "#f0ede2",
            border: "1px solid rgba(199,232,212,.5)",
            px: 1.4,
            py: 0.7,
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: ".1em",
          }}
        >
          FOTO DE REFERÊNCIA
        </Typography>
      </Box>
      <Box sx={{ position: "absolute", left: 24, right: 24, bottom: 22 }}>
        <Typography variant="overline" color="#c7e8d4" sx={{ letterSpacing: 2 }}>
          OBSERVE COM CALMA
        </Typography>
        <Typography color="#f0ede2" fontWeight={700} sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
          Cor, manchas e textura contam uma história.
        </Typography>
      </Box>
    </Box>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, maxWidth: 1240 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr .95fr" }, gap: { xs: 4, md: 7 }, alignItems: "start" }}>
        <Stack spacing={3} sx={{ pt: { md: 2 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Leaf size={18} aria-hidden="true" />
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.5, fontWeight: 800 }}>Caderno de campo para soja</Typography>
          </Stack>
          <Typography component="h1" variant="h1" sx={{ maxWidth: 650, fontSize: { xs: "2.8rem", md: "4.35rem" } }}>
            Olhe de perto. <Box component="span" color="primary.main">Entenda os sinais.</Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, fontSize: { xs: "1rem", md: "1.125rem" } }}>
            Envie uma foto da folha para consultar uma hipótese de doença e orientações de manejo. A análise usa modelos computacionais e apoia a observação — não confirma um diagnóstico em campo.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
            <Button component={Link} to="/chat" variant="contained" size="large" startIcon={<Camera size={20} />}>Analisar uma folha</Button>
            <Button component={Link} to={user ? "/historico" : "/sobre"} endIcon={<ArrowRight size={18} />}>{user ? "Abrir meu caderno" : "Conhecer o projeto"}</Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {IS_DEMO ? "Demonstração local: respostas e análises simuladas são identificadas." : "Entre na sua conta antes de iniciar uma análise e guardar o registro."}
          </Typography>
        </Stack>

        <AnimatedFieldPhoto />
      </Box>

      <Box sx={{ mt: { xs: 6, md: 9 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: ".75fr 1.25fr" }, gap: { xs: 2, md: 6 }, alignItems: "start" }}>
        <Box>
          <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.5, fontWeight: 800 }}>Antes de enviar</Typography>
          <Typography component="h2" variant="h2" sx={{ mt: 1 }}>Fotografe para conseguir enxergar.</Typography>
        </Box>
        <Stack divider={<Divider flexItem />} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          {captureNotes.map(([title, text], index) => <Stack key={title} direction="row" spacing={2} sx={{ py: 2.25 }}>
            <Typography color="primary.main" sx={{ fontFamily: "monospace", fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</Typography>
            <Box><Typography component="h3" variant="h6">{title}</Typography><Typography variant="body2" color="text.secondary">{text}</Typography></Box>
          </Stack>)}
        </Stack>
      </Box>

      <Box sx={{ mt: { xs: 6, md: 9 }, p: { xs: 3, md: 4 }, borderLeft: "4px solid", borderColor: "primary.main", bgcolor: "surface.sunken" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={3} alignItems={{ md: "center" }}>
          <Box><Typography component="h2" variant="h4">Do campo para o registro.</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>Depois da conversa, a foto, a hipótese e os próximos cuidados continuam juntos no histórico.</Typography></Box>
          <Button component={Link} to="/modelos" startIcon={<CheckCircle2 size={18} />}>Ver método e limites</Button>
        </Stack>
      </Box>
    </Container>
  );
}
