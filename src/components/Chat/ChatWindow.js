import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { ArrowDown, Camera, ImageIcon, Leaf } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import InterruptPrompt from "./InterruptPrompt";
import { IMAGE_ACCEPT } from "../../utils/imageUpload";
export default function ChatWindow({
  messages,
  isLoading,
  onSelectFile,
  onSaveDiagnosis,
  pendingInterrupt,
  onAnswerInterrupt,
}) {
  const bottom = useRef(null),
    nearBottom = useRef(true),
    gallery = useRef(null),
    camera = useRef(null);
  const [away, setAway] = useState(false);
  const welcome = messages.length <= 1,
    last = messages[messages.length - 1];
  useEffect(() => {
    if (nearBottom.current && !welcome)
      bottom.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isLoading, pendingInterrupt, welcome]);
  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && !isLoading && !pendingInterrupt) onSelectFile(file);
  };
  return (
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      onScroll={(e) => {
        const el = e.currentTarget;
        nearBottom.current =
          el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        setAway(!nearBottom.current);
      }}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        bgcolor: "background.default",
        overscrollBehavior: "contain",
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          maxWidth: 900,
          mx: "auto",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {welcome ? (
          <Box
            sx={{ maxWidth: 640, mx: "auto", width: "100%", my: "auto", py: 2 }}
          >
            <Chip
              icon={<Leaf size={16} />}
              label="Vamos começar pela folha"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontSize: { xs: "2rem", md: "2.8rem" },
                letterSpacing: "-.04em",
                mb: 2,
              }}
            >
              Um olhar mais atento
              <br />
              para a sua soja.
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Escolha uma foto. Você vai poder conferir antes de iniciar a
              análise.
            </Typography>
            <Stack gap={1.5}>
              <Button
                size="large"
                variant="contained"
                startIcon={<Camera size={21} />}
                onClick={() => camera.current.click()}
              >
                Tirar foto da folha
              </Button>
              <Button
                size="large"
                variant="outlined"
                startIcon={<ImageIcon size={21} />}
                onClick={() => gallery.current.click()}
              >
                Escolher da galeria
              </Button>
            </Stack>
            <Box
              sx={{
                mt: 3,
                p: 2.5,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <Typography fontWeight={700} mb={1}>
                Uma boa foto ajuda muito
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use luz natural, aproxime a câmera e mantenha uma folha em foco.
                Mostre as manchas, sem filtros.
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mt={2}>
              Também pode escrever uma dúvida abaixo. A análise apoia a
              observação e precisa ser interpretada com o contexto da lavoura.
            </Typography>
          </Box>
        ) : (
          <Box
            role="log"
            aria-label="Mensagens do chat"
            aria-live={isLoading ? "off" : "polite"}
          >
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                onSaveDiagnosis={onSaveDiagnosis}
              />
            ))}
          </Box>
        )}
        {isLoading && (
          <Box role="status" aria-label="O Zé está analisando sua mensagem">
            <TypingIndicator toolCall={last?.toolCall} />
          </Box>
        )}
        {pendingInterrupt && !isLoading && (
          <InterruptPrompt
            interrupt={pendingInterrupt}
            onAnswer={onAnswerInterrupt}
            disabled={isLoading}
          />
        )}
        {!isLoading && !pendingInterrupt && last?.diagnosis && (
          <Button
            sx={{ alignSelf: "flex-start", mt: 2 }}
            startIcon={<Camera size={18} />}
            onClick={() => gallery.current.click()}
          >
            Analisar outra folha
          </Button>
        )}
        <div ref={bottom} />
        {away && (
          <Button
            variant="contained"
            startIcon={<ArrowDown size={16} />}
            sx={{ position: "sticky", bottom: 8, alignSelf: "center" }}
            onClick={() => {
              nearBottom.current = true;
              bottom.current?.scrollIntoView({ behavior: "auto" });
            }}
          >
            Ir para a resposta mais recente
          </Button>
        )}
      </Box>
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        ref={gallery}
        onChange={pick}
      />
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        hidden
        ref={camera}
        onChange={pick}
      />
    </Box>
  );
}
