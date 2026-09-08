import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import {
  ArrowRight,
  Camera,
  History,
  Leaf,
  ScanLine,
  Sprout,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { IS_DEMO } from "../config/runtime";
function LeafIllustration() {
  return (
    <svg
      viewBox="0 0 460 480"
      role="img"
      aria-label="Ilustração de uma folha de soja em uma área de enquadramento"
      style={{ width: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id="leaf" x1="0" x2="1" y2="1">
          <stop stopColor="#9ad8a0" />
          <stop offset="1" stopColor="#2d7650" />
        </linearGradient>
      </defs>
      <circle cx="230" cy="228" r="176" fill="#fff" opacity=".04" />
      <circle
        cx="230"
        cy="228"
        r="133"
        fill="none"
        stroke="#c7e8d4"
        opacity=".17"
        strokeDasharray="4 9"
      />
      <path
        d="M230 383C235 302 194 211 262 99C367 136 383 286 230 383Z"
        fill="url(#leaf)"
      />
      <path
        d="M231 381Q277 253 263 111M250 316L320 252M262 262L320 197M267 219L299 160M246 330L220 258M262 268L232 212M268 221L243 167"
        fill="none"
        stroke="#c7e8d4"
        strokeWidth="2"
        opacity=".65"
      />
      <path
        d="M109 160V113H156M305 113H352V160M352 313V360H305M156 360H109V313"
        fill="none"
        stroke="#c7e8d4"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="314" cy="222" r="5" fill="#F4C95D" />
      <path d="M314 222H379" stroke="#F4C95D" opacity=".6" />
      <text
        x="230"
        y="434"
        textAnchor="middle"
        fill="#c7e8d4"
        fontSize="12"
        fontFamily="sans-serif"
        letterSpacing="3"
      >
        OBSERVAR É O PRIMEIRO PASSO
      </text>
    </svg>
  );
}
export default function LandingPage() {
  const { user } = useAuth();
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
          gap: { xs: 3, md: 6 },
          alignItems: "center",
        }}
      >
        <Box>
          <Chip
            icon={<Sprout size={16} />}
            label="Tecnologia perto de quem cultiva"
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <Typography
            component="h1"
            sx={{
              fontFamily: (t) => t.typography.fontFamilyDisplay,
              fontWeight: 800,
              fontSize: { xs: "2.7rem", sm: "3.5rem", md: "4.5rem" },
              lineHeight: 1.03,
              letterSpacing: "-.055em",
              maxWidth: 600,
            }}
          >
            Sua soja dá sinais.
            <br />
            <Box component="span" color="primary.main">
              Vamos olhar juntos.
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ my: 3, fontSize: "1.1rem", maxWidth: 490 }}
          >
            Uma foto da folha é o começo. O Zé ajuda a identificar possíveis
            doenças e organiza os próximos cuidados para você.
          </Typography>
          <Stack gap={1.5} direction={{ xs: "column", sm: "row" }}>
            <Button
              component={Link}
              to="/chat"
              variant="contained"
              size="large"
              startIcon={<Camera size={21} />}
            >
              Analisar uma folha
            </Button>
            <Button
              component={Link}
              to={user ? "/historico" : "/sobre"}
              endIcon={user ? <History size={18} /> : <ArrowRight size={18} />}
            >
              {user ? "Ver meu histórico" : "Conhecer o projeto"}
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={2}>
            {IS_DEMO
              ? "Experimente o fluxo com dados simulados, neste computador."
              : "Entre na sua conta para analisar e guardar os resultados."}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: "#123e2b",
            color: "#f0ede2",
            borderRadius: { xs: 5, md: 7 },
            position: "relative",
            overflow: "hidden",
            maxHeight: { xs: 300, md: "none" },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ position: "absolute", top: 22, left: 24, right: 24 }}
          >
            <Typography variant="overline" sx={{ letterSpacing: 2 }}>
              Caderno de campo digital
            </Typography>
            <Leaf size={22} />
          </Stack>
          <Box sx={{ maxWidth: { xs: 300, md: 460 }, mx: "auto" }}>
            <LeafIllustration />
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          mt: { xs: 5, md: 8 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
          gap: 2,
        }}
      >
        {[
          [
            Camera,
            "01",
            "Fotografe com cuidado",
            "Uma folha por vez, com boa luz e os sinais bem visíveis. Confira a foto antes de enviar.",
          ],
          [
            ScanLine,
            "02",
            "Entenda os sinais",
            "Veja a hipótese do modelo e os limites da análise. A foto é uma pista, não uma confirmação.",
          ],
          [
            Sprout,
            "03",
            "Planeje o próximo passo",
            "Consulte as orientações disponíveis e leve o registro a um profissional de agronomia.",
          ],
        ].map(([Icon, number, title, text]) => (
          <Box
            key={number}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Icon size={24} />
              <Typography color="text.secondary" fontFamily="monospace">
                {number}
              </Typography>
            </Stack>
            <Typography component="h2" variant="h6" mb={1}>
              {title}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {text}
            </Typography>
          </Box>
        ))}
      </Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={2}
        sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="body2" color="text.secondary">
          Projeto acadêmico · Instituto Mauá de Tecnologia
          <br />
          Apoio à observação de doenças foliares da soja.
        </Typography>
        <Stack direction="row" gap={1}>
          <Button component={Link} to="/modelos">
            Modelos e evidências
          </Button>
          <Button component={Link} to="/api-docs">
            API
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
