import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, History, MessagesSquare, SquarePen } from "lucide-react";
import { ReactComponent as Marca } from "../assets/brand/marca.svg";
import ChatWindow from "../components/Chat/ChatWindow";
import ChatInput from "../components/Chat/ChatInput";
import SessionsDrawer from "../components/Chat/SessionsDrawer";
import RuntimeNotice from "../components/common/RuntimeNotice";
import QuotaDisplay from "../components/Layout/QuotaDisplay";
import useChat from "../hooks/useChat";
import { saveDiagnosis } from "../services/historyService";
import { validateImage } from "../utils/imageUpload";
export default function ChatPage() {
  const {
    messages,
    isLoading,
    pendingInterrupt,
    send,
    answerInterrupt,
    loadSession,
    clearChat,
    sessionId,
    stop,
  } = useChat();
  const location = useLocation(),
    navigate = useNavigate();
  const [file, setFile] = useState(null),
    [notice, setNotice] = useState(""),
    [sessions, setSessions] = useState(false),
    [dragging, setDragging] = useState(false);
  const counter = useRef(0);
  const stage = useCallback(
    (next) => {
      if (isLoading || pendingInterrupt) {
        setNotice("Conclua a resposta atual antes de escolher outra foto.");
        return;
      }
      const error = validateImage(next);
      if (error) setNotice(error);
      else setFile(next);
    },
    [isLoading, pendingInterrupt],
  );
  const handled = useRef(null);
  useEffect(() => {
    if (location.key === handled.current) return;
    handled.current = location.key;
    if (location.state?.pendingFile) {
      stage(location.state.pendingFile);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, stage, navigate]);
  const saved = async (diagnosis) => {
    await saveDiagnosis(diagnosis);
    setNotice("Resultado guardado no seu histórico.");
    window.dispatchEvent(new CustomEvent("diagnosis-saved"));
  };
  const reset = () => {
    setFile(null);
    clearChat();
  };
  const fileHandled = useCallback(() => setFile(null), []);
  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        counter.current++;
        if (e.dataTransfer.types.includes("Files")) setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        counter.current--;
        if (counter.current <= 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        counter.current = 0;
        setDragging(false);
        const next = e.dataTransfer.files?.[0];
        if (next) stage(next);
      }}
    >
      <Box
        component="header"
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 1, md: 3 },
          py: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ maxWidth: 1200, mx: "auto" }}
        >
          <IconButton component={Link} to="/" aria-label="Voltar ao início">
            <ChevronLeft size={22} />
          </IconButton>
          <Marca style={{ width: 40, height: 40, flexShrink: 0 }} />
          <Box flex={1} minWidth={0}>
            <Typography fontWeight={800} sx={{ fontSize: "1.0625rem", lineHeight: 1.2 }}>
              Zé
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  flexShrink: 0,
                  bgcolor: isLoading ? "warning.main" : "success.main",
                  animation: isLoading ? "zpBlink 1.4s ease-in-out infinite" : "none",
                  "@keyframes zpBlink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
                }}
              />
              <Typography variant="caption" color="text.secondary" noWrap component="div" sx={{ fontSize: ".8125rem" }}>
                {isLoading
                  ? "Analisando…"
                  : pendingInterrupt
                    ? "Aguardando sua resposta"
                    : "Foto, hipótese e próximos cuidados"}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" }, flexShrink: 0 }}>
            <QuotaDisplay />
          </Box>
          <IconButton
            aria-label="Conversas anteriores"
            onClick={() => setSessions(true)}
          >
            <MessagesSquare size={21} />
          </IconButton>
          <IconButton
            component={Link}
            to="/historico"
            aria-label="Histórico de análises"
          >
            <History size={21} />
          </IconButton>
          <IconButton aria-label="Nova conversa" onClick={reset}>
            <SquarePen size={21} />
          </IconButton>
        </Stack>
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            justifyContent: "center",
            pt: 0.5,
          }}
        >
          <QuotaDisplay />
        </Box>
      </Box>
      <RuntimeNotice />
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSelectFile={stage}
        onSaveDiagnosis={saved}
        pendingInterrupt={pendingInterrupt}
        onAnswerInterrupt={answerInterrupt}
      />
      {isLoading && (
        <Box sx={{ textAlign: "center", bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={stop} color="inherit">Interromper resposta</Button>
        </Box>
      )}
      <ChatInput
        onSend={send}
        disabled={isLoading || !!pendingInterrupt}
        pendingFile={file}
        onFileHandled={fileHandled}
      />
      <SessionsDrawer
        open={sessions}
        onClose={() => setSessions(false)}
        onSelect={(id) => {
          setFile(null);
          loadSession(id);
        }}
        onNew={reset}
        currentSessionId={sessionId}
      />
      {dragging && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            bgcolor: "background.paper",
            opacity: 0.95,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            border: "3px dashed",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="h5">Solte a foto para conferir</Typography>
        </Box>
      )}
      <Snackbar
        open={!!notice}
        autoHideDuration={6000}
        onClose={() => setNotice("")}
      >
        <Alert onClose={() => setNotice("")} severity="info">
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
