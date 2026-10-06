import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { ArrowDown, Calendar, Camera, ImageIcon, Info, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import InterruptPrompt from "./InterruptPrompt";
import { IMAGE_ACCEPT } from "../../utils/imageUpload";
import { STARTERS, suggestionsFor } from "../../utils/suggestions";
import { addReminder, hasReminder } from "../../services/reminders";

const chipSx = {
  height: 40,
  border: 0,
  borderRadius: 999,
  bgcolor: "surface.muted",
  color: "text.primary",
  fontFamily: "inherit",
  fontWeight: 700,
  fontSize: "0.875rem",
  px: 1.75,
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  cursor: "pointer",
  "&:hover": { filter: "brightness(.96)" },
};

/** Conversa vazia — m-Chat-Vazio: uma fala do Zé, a foto em destaque e perguntas prontas. */
function EmptyState({ onCamera, onGallery, onAsk }) {
  const appear = (i) => ({ animation: `zpIn .5s ${0.15 + i * 0.2}s cubic-bezier(.2,.7,.2,1) both` });
  return (
    <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1.5, pt: 2 }}>
      <Box sx={{ alignSelf: "flex-start", maxWidth: "86%", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "20px 20px 20px 6px", px: 1.75, py: 1.5, fontSize: "1rem", lineHeight: 1.45, ...appear(0) }}>
        Oi! Me manda a foto de <b>uma folha</b> com as manchas que eu olho pra você.
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 1, ...appear(1) }}>
        <Box component="button" type="button" onClick={onCamera} sx={{ height: 92, borderRadius: "18px", border: 0, bgcolor: "cta.main", color: "cta.contrastText", p: 1.75, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", fontFamily: "inherit", fontWeight: 800, fontSize: "1rem", cursor: "pointer", "&:hover": { bgcolor: "cta.hover" } }}>
          <Camera size={26} strokeWidth={2.2} aria-hidden="true" />
          Fotografar folha
        </Box>
        <Box component="button" type="button" onClick={onGallery} sx={{ height: 92, borderRadius: "18px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", color: "text.primary", p: 1.75, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", fontFamily: "inherit", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
          <ImageIcon size={24} aria-hidden="true" />
          Da galeria
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, ...appear(2) }}>
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.secondary" }}>Ou pergunte</Typography>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {STARTERS.map((s) => (
            <Box key={s.label} component="button" type="button" onClick={() => onAsk(s.text)} sx={{ height: 40, border: "1.5px solid", borderColor: "primary.main", borderRadius: 999, bgcolor: "background.paper", color: "primary.main", fontFamily: "inherit", fontWeight: 700, fontSize: "0.875rem", px: 1.75, cursor: "pointer" }}>
              {s.label}
            </Box>
          ))}
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", display: "flex", gap: 0.75, alignItems: "center" }}>
          <Info size={14} aria-hidden="true" />
          O Zé é um auxiliar, não fonte da verdade.
        </Typography>
      </Box>
    </Box>
  );
}

/** "Continue a conversa" — m-Chat-Sugestoes. */
function Suggestions({ items, onPick }) {
  if (!items.length) return null;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5, mb: 1 }} aria-label="Sugestões para continuar a conversa" role="group">
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.75rem", fontWeight: 700, letterSpacing: ".04em", color: "text.secondary", display: "flex", alignItems: "center", gap: 0.75 }}>
        <Sparkles size={13} aria-hidden="true" />
        CONTINUE A CONVERSA
      </Typography>
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
        {items.map((s, i) => (
          <Box
            key={s.label}
            component={motion.button}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            onClick={() => onPick(s)}
            sx={chipSx}
          >
            {s.action === "reminder" && <Calendar size={14} aria-hidden="true" />}
            {s.action === "camera" && <Camera size={14} aria-hidden="true" />}
            {s.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function ChatWindow({
  messages,
  isLoading,
  onSelectFile,
  pendingInterrupt,
  onAnswerInterrupt,
  onAsk,
  talhoes = [],
}) {
  const navigate = useNavigate();
  const bottom = useRef(null),
    nearBottom = useRef(true),
    gallery = useRef(null);
  const [away, setAway] = useState(false);
  const [reminded, setReminded] = useState(() => new Set());
  const welcome = messages.length === 0,
    last = messages[messages.length - 1];
  // O indicador é útil apenas até o primeiro token. Depois disso a própria
  // resposta em streaming já comunica progresso e o skeleton vira ruído.
  const assistantHasStarted =
    last?.role === "assistant" &&
    (Boolean(last.content?.trim()) || Boolean(last.steps?.length) || Boolean(last.hasImage));
  useEffect(() => {
    if (nearBottom.current && !welcome) bottom.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isLoading, pendingInterrupt, welcome]);
  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && !isLoading && !pendingInterrupt) onSelectFile(file);
  };
  const diagnosis = last?.diagnosis;
  const suggestions =
    !isLoading && !pendingInterrupt && !welcome
      ? suggestionsFor(last, {
          talhoes,
          hasReminder: Boolean(diagnosis && (reminded.has(diagnosis.id) || hasReminder(diagnosis.id))),
        })
      : [];
  const onPick = (s) => {
    if (s.action === "camera") navigate("/camera");
    else if (s.action === "reminder" && diagnosis) {
      addReminder(diagnosis);
      setReminded((r) => new Set(r).add(diagnosis.id));
    } else if (s.text) onAsk?.(s.text);
  };
  return (
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      onScroll={(e) => {
        const el = e.currentTarget;
        nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        setAway(!nearBottom.current);
      }}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        bgcolor: "background.default",
        overscrollBehavior: "contain",
        "@keyframes zpIn": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
      }}
    >
      <Box sx={{ px: { xs: 1.75, md: 3.5 }, py: { xs: 1.75, md: 3 }, maxWidth: 760, mx: "auto", minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        {welcome && !pendingInterrupt ? (
          <EmptyState onCamera={() => navigate("/camera")} onGallery={() => gallery.current.click()} onAsk={(t) => onAsk?.(t)} />
        ) : (
          <>
            <Box role="log" aria-label="Conversa com o Zé" aria-live={isLoading ? "off" : "polite"} sx={{ display: "flex", flexDirection: "column" }}>
              {messages.map((m, i) => {
                const next = messages[i + 1];
                // A foto do turno varre enquanto o Zé analisa (m-Chat-Analisando).
                const scanning = m.role === "user" && Boolean(m.imageUrl) && next?.role === "assistant" && next.isStreaming && !next.content;
                // Pergunta pendente: quem mostra é o InterruptPrompt, não o balão.
                const hideQuestion = Boolean(pendingInterrupt) && i === messages.length - 1;
                return <ChatMessage key={m.id} message={m} scanning={scanning} hideQuestion={hideQuestion} />;
              })}
            </Box>
            {pendingInterrupt && !isLoading && (
              <InterruptPrompt interrupt={pendingInterrupt} onAnswer={onAnswerInterrupt} disabled={isLoading} />
            )}
            <Suggestions items={suggestions} onPick={onPick} />
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
      <input type="file" accept={IMAGE_ACCEPT} hidden ref={gallery} onChange={pick} />
    </Box>
  );
}
