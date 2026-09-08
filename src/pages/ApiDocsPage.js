import React from "react";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Page from "../components/common/Page";
import { API_ORIGIN, IS_DEMO } from "../config/runtime";
import { useAuth } from "../hooks/useAuth";
import TryItPanel from "../components/ApiDocs/TryItPanel";
export default function ApiDocsPage() {
  const { user } = useAuth();
  const endpoints = [
    ["POST", "/auth/login", "Autenticar com e-mail e senha. Retorna o JWT."],
    [
      "POST",
      "/inference",
      "Analisar uma imagem: multipart com image e model. Requer JWT.",
    ],
    [
      "POST",
      "/diagnoses/analyze",
      "Analisar um lote: multipart com images, crop_id e model. Aceita JWT ou X-API-Key (Enterprise).",
    ],
    [
      "POST",
      "/chat/stream",
      "Conversar com eventos SSE: messages, model e, opcionalmente, image, audio e session_id.",
    ],
    [
      "POST",
      "/chat/resume/stream",
      "Retomar uma pergunta do agente: JSON com thread_id e response.",
    ],
    [
      "GET",
      "/diagnoses",
      "Listar análises com page, limit, search e severity. Retorna items e total.",
    ],
    [
      "GET",
      "/action-plans/{disease_id}",
      "Consultar orientações disponíveis no plano.",
    ],
    ["GET", "/auth/api-keys", "Listar chaves de API do perfil Enterprise."],
    [
      "POST",
      "/auth/api-keys",
      "Criar uma chave, enviando name. O segredo aparece uma única vez.",
    ],
    [
      "DELETE",
      "/auth/api-keys/{id}",
      "Revogar uma chave do perfil Enterprise.",
    ],
  ];
  return (
    <Page
      eyebrow="Integração"
      title="A mesma análise, pela API."
      description="Referência dos contratos usados por este aplicativo."
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        {IS_DEMO
          ? "A interface está em demonstração. Os exemplos abaixo descrevem a API real, que precisa estar iniciada separadamente."
          : "A API local precisa estar em execução para usar os exemplos."}
      </Alert>
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          mb: 3,
        }}
      >
        <Typography variant="overline">Endereço base</Typography>
        <Typography
          component="code"
          sx={{ display: "block", overflowWrap: "anywhere", my: 1 }}
        >
          {API_ORIGIN}/api/v1
        </Typography>
        <Button
          component="a"
          href={API_ORIGIN + "/docs"}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir referência OpenAPI local
        </Button>
      </Box>
      <Typography component="h2" variant="h5" mb={2}>
        Autenticação e limites
      </Typography>
      <Typography color="text.secondary" mb={3}>
        O aplicativo usa Authorization: Bearer &lt;token&gt;. A chave X-API-Key
        é destinada à integração Enterprise no endpoint de análise em lote. As
        cotas e os modelos permitidos são verificados pelo backend.
      </Typography>
      <Stack gap={1.5}>
        {endpoints.map(([method, path, description]) => (
          <Box
            key={method + path}
            sx={{
              p: 2.5,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={1.5}
            >
              <Chip
                size="small"
                label={method}
                color={method === "GET" ? "primary" : "default"}
              />
              <Typography
                component="code"
                sx={{ overflowWrap: "anywhere", fontSize: ".9rem" }}
              >
                /api/v1{path}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {description}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Typography component="h2" variant="h5" mt={4} mb={2}>
        Exemplo de análise individual
      </Typography>
      <Box
        component="pre"
        sx={{
          p: 3,
          bgcolor: "#0F1B14",
          color: "#F0EDE2",
          borderRadius: 3,
          overflowX: "auto",
          fontSize: ".85rem",
        }}
      >
        {'curl -X POST "' +
          API_ORIGIN +
          '/api/v1/inference"\n  -H "Authorization: Bearer <seu-token>"\n  -F "image=@folha.jpg"\n  -F "model=resnet50"'}
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Una as linhas em um comando no seu terminal. Tokens e chaves são
        pessoais; não os inclua no código do frontend.
      </Typography>
      <Typography component="h2" variant="h5" mb={2}>
        Experimente POST /inference
      </Typography>
      {user ? (
        <TryItPanel />
      ) : (
        <Alert severity="info">
          Para enviar uma imagem,{" "}
          <Link to="/login" state={{ from: "/api-docs" }}>
            entre na sua conta
          </Link>
          .
        </Alert>
      )}
      <Typography component="h2" variant="h5" mt={4} mb={2}>
        Interpretando as respostas
      </Typography>
      <Typography color="text.secondary">
        401: autenticação ausente ou expirada. 403: recurso não permitido no
        perfil. 413: arquivo excede o limite. 422: revise o formato dos campos.
        429: limite de uso atingido. No chat, aguarde o evento done para
        considerar o turno concluído; interrupt exige uma resposta do usuário.
      </Typography>
    </Page>
  );
}
