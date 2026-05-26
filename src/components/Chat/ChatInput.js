import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Camera, ImageIcon, ArrowUp, Cpu, X, Mic, StopCircle } from 'lucide-react';
import { copy } from '../../copy/ze';

const MODELS = [
  { id: 'ensemble', name: 'Ensemble' },
  { id: 'resnet50', name: 'ResNet-50' },
  { id: 'efficientnet', name: 'EfficientNet-B4' },
  { id: 'vit', name: 'ViT-B/16' },
];

// Maximum recording duration in milliseconds.
const MAX_RECORDING_MS = 60_000;

/**
 * Composer enxuto: camera + pill de texto + enviar.
 * onSend contract: (text: string, imageFile: File|null, model: string, audioFile: File|null) => void
 */
function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [model, setModel] = useState('ensemble');
  const [camAnchor, setCamAnchor] = useState(null);
  const [modelAnchor, setModelAnchor] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);

  const currentModel = MODELS.find((m) => m.id === model);
  const canSend = (text.trim() || imageFile) && !disabled && !isRecording;

  const stageFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
    setCamAnchor(null);
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(text.trim(), imageFile, model, null);
    setText('');
    setImageFile(null);
    setImagePreview(null);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  // --- Voice recording helpers ---

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        stopTracks();
        clearTimeout(recordingTimerRef.current);

        const mimeType = mr.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioFile = new File([blob], 'voice.webm', { type: mimeType });
        audioChunksRef.current = [];

        setIsRecording(false);
        onSend('', imageFile, model, audioFile);
        setImageFile(null);
        setImagePreview(null);
      };

      mr.start();
      setIsRecording(true);

      // Auto-stop after MAX_RECORDING_MS.
      recordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_MS);
    } catch (err) {
      // Permission denied or device unavailable -- fail silently; UI stays usable.
      console.warn('[ChatInput] Microphone access error:', err);
      stopTracks();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    clearTimeout(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Box sx={{ px: { xs: 1.5, md: 2 }, pt: 1, pb: 'calc(10px + env(safe-area-inset-bottom))', backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
      <input type="file" accept=".jpg,.jpeg,.png,.webp" ref={galleryRef} onChange={stageFile} hidden />
      <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={stageFile} hidden />

      {imagePreview && (
        <Box sx={{ mb: 1, display: 'inline-flex', position: 'relative' }}>
          <Box component="img" src={imagePreview} alt="Preview" sx={{ height: 60, borderRadius: 2, border: '1px solid', borderColor: 'divider', objectFit: 'cover', display: 'block' }} />
          <IconButton size="small" onClick={() => { setImageFile(null); setImagePreview(null); }} sx={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, bgcolor: 'secondary.main', color: '#fff', '&:hover': { bgcolor: 'secondary.dark' } }}>
            <X size={11} />
          </IconButton>
        </Box>
      )}

      <Box component="form" onSubmit={submit} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', maxWidth: 1100, mx: 'auto' }}>
        <IconButton
          aria-label="Adicionar foto"
          onClick={(e) => setCamAnchor(e.currentTarget)}
          disabled={disabled || isRecording}
          sx={{ width: 44, height: 44, bgcolor: 'primary.main', color: (t) => t.palette.brand.milho, flexShrink: 0, '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <Camera size={20} />
        </IconButton>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', bgcolor: (t) => t.palette.surface.sunken, borderRadius: 999, px: 2, py: 0.5 }}>
          <InputBase
            fullWidth
            multiline
            maxRows={4}
            placeholder={isRecording ? 'Gravando...' : copy.chat.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled || isRecording}
            sx={{ fontSize: '0.9rem' }}
          />
        </Box>

        {/* Mic button */}
        <IconButton
          aria-label={isRecording ? 'Parar gravacao' : 'Gravar mensagem de voz'}
          onClick={handleMicClick}
          disabled={disabled}
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            bgcolor: isRecording ? 'error.main' : 'action.selected',
            color: isRecording ? '#fff' : 'text.secondary',
            '&:hover': { bgcolor: isRecording ? 'error.dark' : 'action.hover' },
          }}
        >
          {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
        </IconButton>

        <IconButton
          type="submit"
          aria-label="Enviar"
          disabled={!canSend}
          sx={{ width: 44, height: 44, flexShrink: 0, bgcolor: canSend ? 'secondary.main' : 'action.disabledBackground', color: canSend ? '#fff' : 'text.disabled', '&:hover': { bgcolor: canSend ? 'secondary.dark' : undefined } }}
        >
          <ArrowUp size={20} />
        </IconButton>
      </Box>

      {/* seletor de modelo discreto */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.75 }}>
        <Box
          onClick={(e) => !disabled && !isRecording && setModelAnchor(e.currentTarget)}
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: disabled || isRecording ? 'default' : 'pointer', color: 'text.disabled', px: 1 }}
        >
          <Cpu size={11} />
          <Typography sx={{ fontSize: '0.66rem', fontWeight: 600 }}>{currentModel?.name}</Typography>
        </Box>
      </Box>

      <Menu anchorEl={camAnchor} open={Boolean(camAnchor)} onClose={() => setCamAnchor(null)}>
        <MenuItem onClick={() => cameraRef.current?.click()}>
          <ListItemIcon><Camera size={18} /></ListItemIcon>
          <ListItemText>Tirar foto</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => galleryRef.current?.click()}>
          <ListItemIcon><ImageIcon size={18} /></ListItemIcon>
          <ListItemText>Escolher da galeria</ListItemText>
        </MenuItem>
      </Menu>

      <Menu anchorEl={modelAnchor} open={Boolean(modelAnchor)} onClose={() => setModelAnchor(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {MODELS.map((m) => (
          <MenuItem key={m.id} selected={m.id === model} onClick={() => { setModel(m.id); setModelAnchor(null); }}>
            {m.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default ChatInput;