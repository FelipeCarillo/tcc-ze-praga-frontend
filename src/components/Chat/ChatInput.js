import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowUp, Camera, Mic, Square, X } from "lucide-react";
import usePreferredModel from "../../hooks/usePreferredModel";
import { IMAGE_ACCEPT, validateImage } from "../../utils/imageUpload";

/**
 * Composer do chat (m-Chat): câmera, campo em pílula e microfone.
 *
 * A foto não fica mais presa aqui (m-Chat-Analisando): a da câmera vai
 * direto para a análise e a da galeria abre a conferência em tela cheia
 * (`onPickFile`). Enquanto o Zé analisa (`busy`), o campo fica vazio e
 * desabilitado e o microfone vira o botão de parar.
 */
export default function ChatInput({
  onSend,
  disabled = false,
  busy = false,
  onStop,
  autoRecord = false,
  onOpenCamera,
  onPickFile,
}) {
  // O modelo vem da preferência (Perfil / cabeçalho do desktop), não mais de
  // um seletor no composer — como no canvas (m-Chat).
  const { model } = usePreferredModel();
  const [text, setText] = useState(""),
    [error, setError] = useState("");
  const [recording, setRecording] = useState(false),
    [audio, setAudio] = useState(null),
    [audioUrl, setAudioUrl] = useState("");
  useEffect(() => {
    if (!audio) {
      setAudioUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(audio);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);
  const gallery = useRef(null),
    recorder = useRef(null),
    stream = useRef(null),
    timer = useRef(null),
    cancelled = useRef(false),
    mounted = useRef(true),
    sending = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelled.current = true;
      clearTimeout(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  const selectFile = (e) => {
    const next = e.target.files?.[0];
    e.target.value = "";
    if (!next) return;
    const issue = validateImage(next);
    setError(issue);
    if (!issue) onPickFile?.(next);
  };
  const submit = async (e) => {
    e?.preventDefault();
    if (disabled || busy || sending.current || recording || (!text.trim() && !audio)) return;
    sending.current = true;
    setError("");
    try {
      const ok = await onSend(text.trim(), null, model, audio);
      if (ok !== false) {
        setText("");
        setAudio(null);
      } else setError("O envio não foi concluído. Sua mensagem foi mantida para tentar novamente.");
    } catch {
      setError("Não foi possível enviar. Tente novamente.");
    } finally {
      sending.current = false;
    }
  };
  const stopRecording = (discard = false) => {
    cancelled.current = discard;
    clearTimeout(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };
  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Este navegador não permite gravar áudio. Você pode escrever sua mensagem.");
      return;
    }
    try {
      const source = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        source.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = source;
      cancelled.current = false;
      const chunks = [];
      const r = new MediaRecorder(source);
      recorder.current = r;
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = () => {
        source.getTracks().forEach((t) => t.stop());
        if (!cancelled.current && mounted.current) {
          const type = r.mimeType || "audio/webm";
          setAudio(new File(chunks, type.includes("mp4") ? "voz.mp4" : "voz.webm", { type }));
        }
        if (mounted.current) setRecording(false);
      };
      r.start();
      setRecording(true);
      timer.current = setTimeout(() => stopRecording(), 60000);
    } catch {
      setError("Não foi possível acessar o microfone. Confira a permissão do navegador ou escreva sua mensagem.");
    }
  };
  // Atalho "Perguntar por áudio" do Início: abre o chat já gravando.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoRecord && !autoStarted.current && !disabled) {
      autoStarted.current = true;
      startRecording();
    }
    // startRecording é recriada a cada render; o atalho dispara uma vez só.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRecord, disabled]);

  const round = { width: 48, height: 48, flexShrink: 0 };
  const off = disabled || busy;

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 3.5 },
        pt: 1.25,
        pb: "max(18px, env(safe-area-inset-bottom))",
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Box component="form" onSubmit={submit} sx={{ maxWidth: 760, mx: "auto" }}>
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        {audio && (
          <Box component="audio" controls src={audioUrl || undefined} aria-label="Ouvir áudio antes de enviar" sx={{ width: "100%", height: 40, mb: 1 }} />
        )}
        {audio && (
          <Alert
            severity="info"
            sx={{ mb: 1 }}
            action={
              <IconButton aria-label="Descartar áudio" disabled={off} onClick={() => setAudio(null)}>
                <X size={18} />
              </IconButton>
            }
          >
            Áudio pronto. Envie para conferir a transcrição na conversa.
          </Alert>
        )}
        {recording ? (
          <Stack direction="row" gap={1} alignItems="center">
            <Typography role="status" flex={1}>
              Gravando · até 1 minuto
            </Typography>
            <Button onClick={() => stopRecording(true)}>Descartar</Button>
            <Button variant="contained" startIcon={<Square size={16} />} onClick={() => stopRecording()}>
              Concluir
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" gap={1} alignItems="flex-end">
            <IconButton
              aria-label="Fotografar folha"
              disabled={off}
              onClick={() => (onOpenCamera ? onOpenCamera() : gallery.current.click())}
              sx={{ ...round, borderRadius: "14px", bgcolor: "background.default", color: "text.primary", "&:hover": { bgcolor: "surface.muted" } }}
            >
              <Camera size={22} strokeWidth={2.2} />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder={busy ? "O Zé está analisando…" : "Pergunte ao Zé…"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                  minHeight: 48,
                  fontSize: "1rem",
                  bgcolor: "background.default",
                  "& fieldset": { borderWidth: "1.5px", borderColor: "divider" },
                },
              }}
              value={busy ? "" : text}
              onChange={(e) => setText(e.target.value)}
              disabled={off}
              slotProps={{ htmlInput: { "aria-label": "Mensagem para o Zé", maxLength: 10000 } }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(min-width: 900px)").matches) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            {busy ? (
              <IconButton
                aria-label="Parar análise"
                onClick={onStop}
                sx={{ ...round, border: "1.5px solid", borderColor: "text.primary", bgcolor: "background.paper", color: "text.primary" }}
              >
                <Square size={16} fill="currentColor" />
              </IconButton>
            ) : !text && !audio ? (
              <IconButton
                aria-label="Gravar mensagem de voz"
                disabled={disabled}
                onClick={startRecording}
                sx={{ ...round, bgcolor: "cta.main", color: "cta.contrastText", "&:hover": { bgcolor: "cta.hover" } }}
              >
                <Mic size={22} strokeWidth={2.2} />
              </IconButton>
            ) : (
              <IconButton
                type="submit"
                aria-label="Enviar mensagem"
                disabled={disabled}
                sx={{ ...round, bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }}
              >
                <ArrowUp size={22} />
              </IconButton>
            )}
          </Stack>
        )}
        <input ref={gallery} type="file" accept={IMAGE_ACCEPT} hidden onChange={selectFile} />
      </Box>
    </Box>
  );
}
