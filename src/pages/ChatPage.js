import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, MessagesSquare, Plus } from "lucide-react";
import { ReactComponent as Marca } from "../assets/brand/marca.svg";
import ChatWindow from "../components/Chat/ChatWindow";
import ChatInput from "../components/Chat/ChatInput";
import SessionsDrawer from "../components/Chat/SessionsDrawer";
import SessionsList, { useSessions } from "../components/Chat/SessionsList";
import LaudoPanel from "../components/Chat/LaudoPanel";
import BrandLockup from "../components/Brand/BrandLockup";
import RuntimeNotice from "../components/common/RuntimeNotice";
import useChat from "../hooks/useChat";
import usePreferredModel from "../hooks/usePreferredModel";
import { getUsageSummary } from "../services/usageService";
import { validateImage } from "../utils/imageUpload";
import TalhaoPicker from "../components/Talhao/TalhaoPicker";
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
  // Título da conversa no desktop: a primeira mensagem do produtor.
  const firstUser = messages.find((m) => m.role === "user" && m.content);
  const title = firstUser
    ? firstUser.content.length > 60
      ? firstUser.content.slice(0, 57) + "…"
      : firstUser.content
    : "Nova conversa";
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
        flexDirection: "row",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.default",
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
      {/* ── Lateral escura do desktop (d-Chat) ── */}
      <Sidebar
        sessionId={sessionId}
        onNew={reset}
        onSelect={(id) => {
          setFile(null);
          loadSession(id);
        }}
      />

      <Box sx={{ flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Celular (m-Chat): voltar, marca, "Zé" com o talhão como status e
            as conversas. Desktop: título da conversa e o modelo. */}
        <Box component="header" sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" gap={1.25} sx={{ display: { xs: "flex", md: "none" }, px: 1.5, py: 1.25 }}>
            <IconButton component={Link} to="/" aria-label="Voltar ao início" sx={{ ml: -0.5 }}>
              <ChevronLeft size={24} strokeWidth={2.2} />
            </IconButton>
            <Marca style={{ width: 40, height: 40, flexShrink: 0 }} aria-hidden="true" />
            <Box flex={1} minWidth={0}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.0625rem", lineHeight: 1.2 }}>Zé</Typography>
              <TalhaoPicker variant="inline" busy={isLoading} disabled={isLoading} />
            </Box>
            <IconButton aria-label="Conversas anteriores" onClick={() => setSessions(true)}>
              <MessagesSquare size={22} />
            </IconButton>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5} flexWrap="wrap" sx={{ display: { xs: "none", md: "flex" }, px: 3.5, py: 2 }}>
            <Box minWidth={0}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.125rem" }} noWrap>
                {title}
              </Typography>
              <TalhaoPicker variant="inline" busy={isLoading} disabled={isLoading} />
            </Box>
            <ModelSelect disabled={isLoading} />
          </Stack>
        </Box>
        <RuntimeNotice />
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSelectFile={stage}
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
          autoRecord={Boolean(location.state?.startAudio)}
          onOpenCamera={() => navigate("/camera")}
        />
      </Box>

      {/* ── Laudo à direita no desktop largo (d-Chat) ── */}
      <LaudoPanel messages={messages} />

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

/** Seletor de modelo do cabeçalho no desktop — mesma preferência do Perfil. */
function ModelSelect({ disabled }) {
  const { model, options, choose } = usePreferredModel();
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography component="label" htmlFor="chat-modelo" sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
        Modelo
      </Typography>
      <Select
        id="chat-modelo"
        size="small"
        value={model}
        disabled={disabled}
        onChange={(e) => choose(e.target.value)}
        sx={{ height: 40, borderRadius: "10px", bgcolor: "background.default", fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.8125rem" }}
      >
        {options.map((m) => (
          <MenuItem key={m.id} value={m.id}>
            {m.name}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}

/** Lateral escura do d-Chat: marca, nova análise, conversas e o uso do dia. */
function Sidebar({ sessionId, onNew, onSelect }) {
  const { sessions, loading, error, reload } = useSessions(true);
  const [usage, setUsage] = useState(null);
  useEffect(() => {
    // Uma conversa nova (ou que avançou) aparece na lista e mexe na cota.
    reload();
    getUsageSummary()
      .then(setUsage)
      .catch(() => {});
  }, [sessionId, reload]);
  const inf = usage?.inference;
  const limited = inf && inf.limit !== null && inf.limit !== undefined;
  return (
    <Box
      component="aside"
      aria-label="Conversas"
      sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 2.25, flex: "1 1 260px", maxWidth: 300, minWidth: 240, height: "100%", bgcolor: "#0B1510", color: "#EEF2E8", p: 2.5, pt: 2.5, boxSizing: "border-box", overflowY: "auto" }}
    >
      <BrandLockup size={32} tone="light" sx={{ px: 0.5 }} />
      <Button
        onClick={onNew}
        startIcon={<Plus size={18} strokeWidth={2.4} />}
        sx={{ height: 48, borderRadius: "14px", bgcolor: "#C8F169", color: "#0F1A13", fontWeight: 800, "&:hover": { bgcolor: "#B6E04F" } }}
      >
        Nova análise
      </Button>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <SessionsList sessions={sessions} loading={loading} error={error} currentSessionId={sessionId} onSelect={onSelect} tone="dark" />
      </Box>
      {inf && (
        <Box component={Link} to="/planos" sx={{ display: "flex", flexDirection: "column", gap: 1.25, bgcolor: "#14251B", borderRadius: "14px", p: 1.5, color: "#EEF2E8", textDecoration: "none" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span>Análises hoje</span>
            <Box component="span" sx={{ fontFamily: (t) => t.typography.fontFamilyMono }}>
              {limited ? `${inf.used}/${inf.limit}` : `${inf.used} · sem limite`}
            </Box>
          </Box>
          {limited && (
            <Box sx={{ height: 6, bgcolor: "#22362A", borderRadius: 999 }}>
              <Box sx={{ width: `${Math.min(100, (inf.used / Math.max(1, inf.limit)) * 100)}%`, height: "100%", bgcolor: "#C8F169", borderRadius: 999 }} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
