import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { ArrowDown, Camera, ImageIcon, Leaf } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import InterruptPrompt from "./InterruptPrompt";
import { IMAGE_ACCEPT } from "../../utils/imageUpload";

function ObservationWorkspace({ messages, isLoading, pendingInterrupt }) {
  const photoIndex = [...messages].map((message, index) => message.imageUrl ? index : -1).filter((index) => index >= 0).pop();
  if (photoIndex === undefined) return null;
  const photoMessage = messages[photoIndex];
  const diagnosis = messages.slice(photoIndex + 1).find((message) => message.diagnosis)?.diagnosis;
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: ".85fr 1.15fr" }, gap: 2, mb: 3, p: { xs: 1.5, md: 2 }, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>Folha em análise</Typography>
        <Box component="img" src={photoMessage.imageUrl} alt="Foto da folha enviada nesta análise" sx={{ mt: .75, width: "100%", height: { xs: 180, md: 250 }, objectFit: "contain", bgcolor: "surface.sunken" }} />
        <Typography variant="caption" color="text.secondary" display="block" mt={.75}>{photoMessage.content || "Foto enviada"}</Typography>
      </Box>
      <Stack spacing={1.25} justifyContent="center">
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>Resultado da observação</Typography>
        {pendingInterrupt ? (
          <><Typography component="h2" variant="h5">Uma resposta sua é necessária.</Typography><Typography variant="body2" color="text.secondary">A pergunta está logo abaixo e continua visível durante esta análise.</Typography></>
        ) : diagnosis ? (
          <><Typography component="h2" variant="h4">{diagnosis.disease}</Typography><Typography variant="body2" color="text.secondary">Hipótese do modelo{diagnosis.modelUsed ? ` · ${diagnosis.modelUsed}` : ""}. Confira a ficha completa e os próximos cuidados na conversa.</Typography></>
        ) : isLoading ? (
          <><Typography component="h2" variant="h5">Análise em andamento</Typography><Typography variant="body2" color="text.secondary">Não há porcentagem disponível para esta etapa. Você pode interromper a resposta se precisar.</Typography></>
        ) : <><Typography component="h2" variant="h5">Aguardando observação</Typography><Typography variant="body2" color="text.secondary">Envie uma pergunta ou uma foto para continuar. Uma hipótese só aparece quando o serviço devolve um diagnóstico estruturado.</Typography></>}
      </Stack>
    </Box>
  );
}
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
  // O indicador é útil apenas até o primeiro token. Depois disso a própria
  // resposta em streaming já comunica progresso e o skeleton vira ruído.
  const assistantHasStarted =
    last?.role === "assistant" && Boolean(last.content?.trim());
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
          <>
            <ObservationWorkspace messages={messages} isLoading={isLoading} pendingInterrupt={pendingInterrupt} />
            {pendingInterrupt && !isLoading && (
              <InterruptPrompt interrupt={pendingInterrupt} onAnswer={onAnswerInterrupt} disabled={isLoading} />
            )}
            <Box role="log" aria-label="Conversa sobre esta análise" aria-live={isLoading ? "off" : "polite"}>
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                onSaveDiagnosis={onSaveDiagnosis}
              />
            ))}
          </Box>
          </>
        )}
        <AnimatePresence initial={false}>
          {isLoading && !assistantHasStarted && (
            <Box
              key="typing-indicator"
              component={motion.div}
              role="status"
              aria-label="O Zé está analisando sua mensagem"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96, filter: "blur(2px)" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <TypingIndicator toolCall={last?.toolCall} />
            </Box>
          )}
        </AnimatePresence>
        {welcome && pendingInterrupt && !isLoading && (
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
