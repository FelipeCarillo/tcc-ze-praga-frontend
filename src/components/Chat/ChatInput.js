import React, { useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import { Paperclip, Camera, Send, X, Cpu, ChevronDown, Video, CircleDot } from 'lucide-react';

const MODELS = [
  { id: 'ensemble', name: 'Ensemble', desc: 'Combinação dos 3 modelos — maior precisão' },
  { id: 'resnet50', name: 'ResNet-50', desc: 'CNN clássica — rápida e confiável' },
  { id: 'efficientnet', name: 'EfficientNet-B4', desc: 'Melhor relação custo-benefício' },
  { id: 'vit', name: 'ViT-B/16', desc: 'Vision Transformer — captura padrões globais' },
];

function ChatInput({ onSend, disabled = false }) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [modelAnchor, setModelAnchor] = useState(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel);
  const canSend = (text.trim() || imageFile) && !disabled;

  const startWebcam = useCallback(async () => {
    setWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setWebcamOpen(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setWebcamOpen(false);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `captura-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
      stopWebcam();
    }, 'image/jpeg', 0.92);
  }, [stopWebcam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    onSend(text.trim(), imageFile, selectedModel);
    setText('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const borderColor = focused
    ? theme.palette.primary.main
    : alpha(theme.palette.divider, 1);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        backgroundColor: 'background.default',
      }}
    >
      <input type="file" accept=".jpg,.jpeg,.png,.webp" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />

      {/* Image preview */}
      {imagePreview && (
        <Box sx={{ mb: 1.5, display: 'inline-flex', position: 'relative' }}>
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              height: 64,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <IconButton
            size="small"
            onClick={() => { setImageFile(null); setImagePreview(null); }}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 20,
              height: 20,
              backgroundColor: '#E63946',
              color: 'white',
              '&:hover': { backgroundColor: '#C1121F' },
            }}
          >
            <X size={11} />
          </IconButton>
        </Box>
      )}

      {/* Main input container */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          borderRadius: '16px',
          border: '1.5px solid',
          borderColor: borderColor,
          backgroundColor: 'background.paper',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused
            ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
            : `0 2px 12px ${alpha(theme.palette.common.black, 0.06)}`,
          overflow: 'hidden',
        }}
      >
        {/* Text + actions row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', px: 1.5, pt: 1, pb: 0.5 }}>
          {/* Left: attachment icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, pb: 0.75, flexShrink: 0 }}>
            <Tooltip title="Anexar imagem">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                size="small"
                sx={{
                  color: 'text.disabled',
                  '&:hover': { color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.07) },
                }}
              >
                <Paperclip size={17} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Câmera">
              <IconButton
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled}
                size="small"
                sx={{
                  color: 'text.disabled',
                  '&:hover': { color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.07) },
                }}
              >
                <Camera size={17} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Capturar vídeo">
              <IconButton
                onClick={startWebcam}
                disabled={disabled}
                size="small"
                sx={{
                  color: 'text.disabled',
                  '&:hover': { color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.07) },
                }}
              >
                <Video size={17} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Text field */}
          <TextField
            fullWidth
            multiline
            maxRows={5}
            placeholder="Digite ou envie uma foto da folha..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            variant="standard"
            sx={{
              mx: 0.5,
              '& .MuiInput-root': {
                fontSize: '0.9rem',
                '&:before': { display: 'none' },
                '&:after': { display: 'none' },
              },
              '& textarea': {
                py: 1,
                color: 'text.primary',
                '&::placeholder': { color: 'text.disabled', opacity: 1 },
              },
            }}
          />

          {/* Send button */}
          <Box sx={{ pb: 0.75, flexShrink: 0 }}>
            <IconButton
              type="submit"
              disabled={!canSend}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: canSend ? 'primary.main' : 'action.disabledBackground',
                color: canSend ? 'white' : 'text.disabled',
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: canSend ? 'primary.dark' : undefined },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'text.disabled',
                },
              }}
            >
              <Send size={16} />
            </IconButton>
          </Box>
        </Box>

        {/* Model selector footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            pb: 1,
            pt: 0,
          }}
        >
          <Box
            onClick={(e) => !disabled && setModelAnchor(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.35,
              borderRadius: '8px',
              cursor: disabled ? 'default' : 'pointer',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.15s',
              '&:hover': !disabled ? {
                borderColor: alpha(theme.palette.primary.main, 0.4),
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              } : {},
            }}
          >
            <Cpu size={11} color={theme.palette.primary.main} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary' }}>
              {currentModel?.name}
            </Typography>
            <ChevronDown size={10} color={theme.palette.text.disabled} />
          </Box>
          <Typography variant="caption" sx={{ ml: 'auto', color: 'text.disabled', fontSize: '0.68rem' }}>
            Enter para enviar · Shift+Enter nova linha
          </Typography>
        </Box>
      </Box>

      {/* Model menu */}
      <Menu
        anchorEl={modelAnchor}
        open={Boolean(modelAnchor)}
        onClose={() => setModelAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            backgroundColor: 'background.paper',
            minWidth: 240,
            mt: -0.5,
          },
        }}
      >
        {MODELS.map((m) => (
          <MenuItem
            key={m.id}
            selected={m.id === selectedModel}
            onClick={() => { setSelectedModel(m.id); setModelAnchor(null); }}
            sx={{
              py: 1.25,
              px: 2,
              borderRadius: '8px',
              mx: 0.5,
              my: 0.25,
              '&.Mui-selected': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
              '&.Mui-selected:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) },
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: m.id === selectedModel ? 700 : 500, fontSize: '0.85rem' }}>
                {m.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                {m.desc}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Webcam dialog */}
      <Dialog open={webcamOpen} onClose={stopWebcam} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Video size={18} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Captura de Vídeo</Typography>
          </Box>
          <IconButton onClick={stopWebcam} size="small" sx={{ color: 'text.secondary' }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', mb: 2 }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, textAlign: 'center' }}>
            Posicione a folha de soja no centro da câmera e clique para capturar.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="primary" startIcon={<CircleDot size={16} />} onClick={captureFrame} sx={{ px: 4, borderRadius: '10px' }}>
              Capturar Frame
            </Button>
            <Button variant="outlined" onClick={stopWebcam} sx={{ borderRadius: '10px' }}>
              Cancelar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ChatInput;
