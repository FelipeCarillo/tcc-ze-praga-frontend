import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowUp, Camera, ImageIcon, Mic, Square, X } from "lucide-react";
import { useFeatures } from "../../contexts/FeaturesContext";
import {
  MODELS,
  allowedModelIds,
  defaultModelId,
} from "../../data/diagnosisModels";
import { IMAGE_ACCEPT, validateImage } from "../../utils/imageUpload";

export default function ChatInput({
  onSend,
  disabled = false,
  pendingFile,
  onFileHandled,
}) {
  const features = useFeatures(),
    allowed = useMemo(() => allowedModelIds(features), [features]);
  const [model, setModel] = useState(() => defaultModelId(features));
  const [text, setText] = useState(""),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [error, setError] = useState(""),
    [settings, setSettings] = useState(false);
  const [recording, setRecording] = useState(false),
    [audio, setAudio] = useState(null),
    [audioUrl, setAudioUrl] = useState("");
  useEffect(() => {
    if (!audio) {
      setAudioUrl("");
      return;
    }
    const url = URL.createObjectURL(audio);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);
  const gallery = useRef(null),
    camera = useRef(null),
    recorder = useRef(null),
    stream = useRef(null),
    timer = useRef(null),
    cancelled = useRef(false),
    mounted = useRef(true),
    sending = useRef(false);
  useEffect(() => {
    if (allowed && !allowed.has(model)) setModel(defaultModelId(features));
  }, [allowed, model, features]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (pendingFile) {
      const issue = validateImage(pendingFile);
      setError(issue);
      if (!issue) setFile(pendingFile);
      onFileHandled?.();
    }
  }, [pendingFile, onFileHandled]);
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
    if (!issue) setFile(next);
  };
  const submit = async (e) => {
    e?.preventDefault();
    if (
      disabled ||
      sending.current ||
      recording ||
      (!text.trim() && !file && !audio)
    )
      return;
    sending.current = true;
    setError("");
    try {
      const ok = await onSend(text.trim(), file, model, audio);
      if (ok !== false) {
        setText("");
        setFile(null);
        setAudio(null);
      } else
        setError(
          "O envio não foi concluído. Sua foto e mensagem foram mantidas para tentar novamente.",
        );
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
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "Este navegador não permite gravar áudio. Você pode escrever sua mensagem.",
      );
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
          setAudio(
            new File(chunks, type.includes("mp4") ? "voz.mp4" : "voz.webm", {
              type,
            }),
          );
        }
        if (mounted.current) setRecording(false);
      };
      r.start();
      setRecording(true);
      timer.current = setTimeout(() => stopRecording(), 60000);
    } catch {
      setError(
        "Não foi possível acessar o microfone. Confira a permissão do navegador ou escreva sua mensagem.",
      );
    }
  };
  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 3 },
        pt: 1.5,
        pb: "max(12px, env(safe-area-inset-bottom))",
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Box
        component="form"
        onSubmit={submit}
        sx={{ maxWidth: 850, mx: "auto" }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        {file && (
          <Box
            sx={{
              p: 1.5,
              mb: 1.5,
              bgcolor: "background.default",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                component="img"
                src={preview || undefined}
                alt="Foto selecionada para conferir antes da análise"
                sx={{
                  width: 90,
                  height: 100,
                  objectFit: "contain",
                  borderRadius: 2,
                }}
              />
              <Box flex={1} minWidth={0}>
                <Typography fontWeight={700}>Confira sua foto</Typography>
                <Typography variant="body2" color="text.secondary">
                  A folha está nítida e bem iluminada?
                </Typography>
                <Typography noWrap variant="caption">
                  {file.name}
                </Typography>
              </Box>
              <IconButton
                aria-label="Remover foto"
                disabled={disabled}
                onClick={() => setFile(null)}
              >
                <X size={20} />
              </IconButton>
            </Stack>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={disabled || recording}
              sx={{ mt: 1.5 }}
            >
              {disabled ? "Analisando…" : "Analisar esta folha"}
            </Button>
          </Box>
        )}
        {audio && (
          <Box
            component="audio"
            controls
            src={audioUrl || undefined}
            aria-label="Ouvir áudio antes de enviar"
            sx={{ width: "100%", height: 40, mb: 1 }}
          />
        )}
        {audio && (
          <Alert
            severity="info"
            action={
              <IconButton
                aria-label="Descartar áudio"
                disabled={disabled}
                onClick={() => setAudio(null)}
              >
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
            <Button
              variant="contained"
              startIcon={<Square size={16} />}
              onClick={() => stopRecording()}
            >
              Concluir
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" gap={0.5} alignItems="flex-end">
            <IconButton
              aria-label="Escolher foto da galeria"
              disabled={disabled}
              onClick={() => gallery.current.click()}
            >
              <ImageIcon size={21} />
            </IconButton>
            <IconButton
              aria-label="Tirar foto"
              disabled={disabled}
              onClick={() => camera.current.click()}
            >
              <Camera size={21} />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder={
                file
                  ? "Acrescente uma observação (opcional)"
                  : "Pergunte ao Zé…"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={disabled}
              slotProps={{
                htmlInput: {
                  "aria-label": "Mensagem para o Zé",
                  maxLength: 10000,
                },
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  window.matchMedia("(min-width: 900px)").matches
                ) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            {!text && !file && !audio ? (
              <IconButton
                aria-label="Gravar mensagem de voz"
                disabled={disabled}
                onClick={startRecording}
              >
                <Mic size={21} />
              </IconButton>
            ) : (
              <IconButton
                type="submit"
                aria-label="Enviar mensagem"
                disabled={disabled}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <ArrowUp size={22} />
              </IconButton>
            )}
          </Stack>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          mt={0.5}
        >
          <Typography variant="caption" color="text.secondary">
            JPG, PNG ou WebP · até 10 MB
          </Typography>
          <Button
            size="small"
            onClick={() => setSettings((v) => !v)}
            aria-expanded={settings}
          >
            Modelo: {MODELS.find((m) => m.id === model)?.name}
          </Button>
        </Stack>
        <Collapse in={settings}>
          <TextField
            select
            fullWidth
            label="Modelo de análise"
            value={model}
            disabled={disabled}
            onChange={(e) => setModel(e.target.value)}
            sx={{ mt: 1, mb: 1 }}
            helperText="Disponibilidade definida pelo seu plano."
          >
            {MODELS.filter((m) => !allowed || allowed.has(m.id)).map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} · {m.detail}
              </MenuItem>
            ))}
          </TextField>
        </Collapse>
        <input
          ref={gallery}
          type="file"
          accept={IMAGE_ACCEPT}
          hidden
          onChange={selectFile}
        />
        <input
          ref={camera}
          type="file"
          accept={IMAGE_ACCEPT}
          capture="environment"
          hidden
          onChange={selectFile}
        />
      </Box>
    </Box>
  );
}
