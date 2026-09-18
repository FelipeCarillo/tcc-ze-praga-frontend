import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { ArrowRight, Camera, CheckCircle2, Leaf } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { IS_DEMO } from "../config/runtime";
import soybeanRustUsda from "../assets/soybean-rust-usda.jpg";

const captureNotes = [
  ["Aproxime", "Uma folha por vez, em foco e com as manchas visíveis."],
  ["Use luz natural", "Evite filtros e reflexos que escondam a textura."],
  ["Confira antes", "Você revisa a imagem e decide quando enviar."],
];

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

        <Box component="figure" sx={{ m: 0, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "surface.sunken", borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1.25 }}>Exemplo documental</Typography>
            <Typography component="h2" variant="h5">O que uma observação registra</Typography>
          </Box>
          <Box sx={{ minHeight: { xs: 245, md: 330 }, display: "grid", placeItems: "center", p: { xs: 2, md: 3 }, bgcolor: "#18261D" }}>
            <Box component="img" src={soybeanRustUsda} alt="Folhas de soja com sinais de ferrugem asiática" sx={{ maxWidth: "100%", maxHeight: 290, width: "100%", objectFit: "contain" }} />
          </Box>
          <Box component="figcaption" sx={{ p: 2.25 }}>
            <Typography variant="body2" color="text.secondary">Folhas com sinais visíveis: uma referência para observar foco, cor e textura. Esta imagem não é uma análise do usuário.</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>USDA · domínio público · crédito e licença em ASSETS.md</Typography>
          </Box>
        </Box>
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
