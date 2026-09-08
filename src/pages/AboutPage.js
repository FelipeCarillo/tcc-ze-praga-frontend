import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { Camera, Leaf } from "lucide-react";
import Page from "../components/common/Page";
const team = [
  "Breno Coutinho Rodrigues",
  "Felipe Carillo",
  "Gabriel Soares Teixeira",
  "João Pedro Galhardo",
  "Luca Pinheiro Gomes",
];
export default function AboutPage() {
  return (
    <Page
      eyebrow="TCC · Instituto Mauá de Tecnologia"
      title="Tecnologia que começa com uma observação."
      description="O Zé Praga aproxima modelos de visão computacional das dúvidas que aparecem na lavoura."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
          gap: 4,
          mb: 5,
        }}
      >
        <Box>
          <Typography variant="h5" component="h2" mb={2}>
            Um apoio para olhar os sinais da soja
          </Typography>
          <Typography color="text.secondary" mb={2}>
            O projeto reúne uma interface em português, modelos de classificação
            de imagens e um agente de conversa. A proposta é organizar hipóteses
            e informações para apoiar a observação de doenças foliares.
          </Typography>
          <Typography color="text.secondary">
            Uma fotografia não substitui a avaliação da planta, do ambiente e do
            histórico da lavoura. O Zé apresenta o que o modelo identificou e as
            orientações do catálogo; a decisão de manejo exige contexto e
            acompanhamento profissional.
          </Typography>
          <Button component={Link} to="/modelos" sx={{ mt: 2 }}>
            Ver resultados e limitações dos modelos
          </Button>
        </Box>
        <Box
          sx={{ p: 4, bgcolor: "#123e2b", color: "#F0EDE2", borderRadius: 4 }}
        >
          <Leaf size={42} />
          <Typography variant="h4" mt={3} mb={2}>
            Foto → hipótese → próximos cuidados.
          </Typography>
          <Typography>
            A experiência foi desenhada primeiro para o celular, com conferência
            da imagem, retorno durante a espera e acesso ao histórico.
          </Typography>
        </Box>
      </Box>
      <Typography component="h2" variant="h4" mb={1}>
        Quem constrói o Zé
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Orientação: Profs. Alexsander Tressino de Carvalho e Gabriel de Souza
        Lima.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2,1fr)",
            md: "repeat(3,1fr)",
          },
          gap: 2,
        }}
      >
        {team.map((name) => (
          <Stack
            key={name}
            direction="row"
            alignItems="center"
            gap={2}
            sx={{
              p: 2.5,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Avatar
              sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              {name[0]}
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Desenvolvimento e pesquisa
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>
      <Box sx={{ mt: 5, p: 3, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography component="h2" variant="h5" mb={2}>
          Da pesquisa à demonstração
        </Typography>
        <Typography color="text.secondary" mb={3}>
          O frontend usa React e MUI. A API usa FastAPI, e os modelos são
          exportados para ONNX. Os resultados publicados pertencem à avaliação
          no conjunto ASDID, sem garantia de desempenho em campo.
        </Typography>
        <Button
          component={Link}
          to="/chat"
          variant="contained"
          startIcon={<Camera size={20} />}
        >
          Conhecer a experiência
        </Button>
      </Box>
    </Page>
  );
}
