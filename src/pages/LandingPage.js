import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import {
  ArrowRight,
  Camera,
  History,
  ScanLine,
  Sprout,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { IS_DEMO } from "../config/runtime";
import soybeanRust from "../assets/soybean-rust.jpg";

function FieldPhoto() {
  return (
    <Box
      role="img"
      aria-label="Foto de campo com folhas de soja apresentando sinais visíveis"
      sx={{
        height: { xs: 300, md: 420 },
        overflow: "hidden",
        position: "relative",
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
          bgcolor: "rgba(7, 28, 17, .12)",
          background: "linear-gradient(180deg, rgba(7,28,17,.48), transparent 46%, rgba(7,28,17,.58))",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "-20% auto -20% 0",
            width: "23%",
            background: "linear-gradient(90deg, transparent, rgba(240,237,226,.72), transparent)",
            animation: "field-photo-light 9s ease-in-out infinite",
          },
        }}
      />
      <Box sx={{ position: "absolute", top: 26, left: 26 }}>
        <Typography
          component="span"
          sx={{
            bgcolor: "rgba(15,27,20,.78)",
            color: "#f0ede2",
            border: "1px solid rgba(199,232,212,.5)",
            borderRadius: 999,
            px: 1.6,
            py: 0.8,
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: ".1em",
          }}
        >
          FOTO DE CAMPO
        </Typography>
      </Box>
      <Box sx={{ position: "absolute", left: 26, right: 26, bottom: 24 }}>
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
          <FieldPhoto />
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
