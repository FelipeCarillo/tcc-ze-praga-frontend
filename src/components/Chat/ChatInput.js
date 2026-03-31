import React, { useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Paperclip, Camera, Send, X, Cpu, ChevronDown, Video, CircleDot } from 'lucide-react';

const availableModels = [
  { id: 'ensemble', name: 'Ensemble', description: 'Combinação dos 3 modelos — maior precisão' },
  { id: 'resnet50', name: 'ResNet-50', description: 'CNN clássica — rápida e confiável' },
  { id: 'efficientnet', name: 'EfficientNet-B4', description: 'Melhor relação custo-benefício' },
  { id: 'vit', name: 'ViT-B/16', description: 'Vision Transformer — captura padrões globais' },
];

function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [modelMenuAnchor, setModelMenuAnchor] = useState(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentModel = availableModels.find((m) => m.id === selectedModel);

  const startWebcam = useCallback(async () => {
    setWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setWebcamOpen(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
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
    if (!text.trim() && !imageFile) return;

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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: imagePreview ? 0 : 1 }}>
        <Tooltip title="Modelo de classificação">
          <Chip
            icon={<Cpu size={14} />}
            label={currentModel?.name || 'Ensemble'}
            deleteIcon={<ChevronDown size={14} />}
            onDelete={(e) => setModelMenuAnchor(e.currentTarget.parentElement)}
            onClick={(e) => setModelMenuAnchor(e.currentTarget)}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              backgroundColor: 'surface.sunken',
              '& .MuiChip-icon': { color: 'primary.main' },
              '& .MuiChip-deleteIcon': { color: 'primary.main' },
              cursor: 'pointer',
            }}
          />
        </Tooltip>
        <Menu
          anchorEl={modelMenuAnchor}
          open={Boolean(modelMenuAnchor)}
          onClose={() => setModelMenuAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {availableModels.map((model) => (
            <MenuItem
              key={model.id}
              selected={model.id === selectedModel}
              onClick={() => { setSelectedModel(model.id); setModelMenuAnchor(null); }}
              sx={{
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: model.id === selectedModel ? 700 : 500 }}>{model.name}</Typography>}
                secondary={<Typography variant="caption" color="text.secondary">{model.description}</Typography>}
              />
            </MenuItem>
          ))}
        </Menu>
      </Box>
      {imagePreview && (
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              height: 72,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <IconButton
            size="small"
            onClick={removeImage}
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              bgcolor: '#E63946',
              color: 'white',
              width: 20,
              height: 20,
              '&:hover': { bgcolor: '#C1121F' },
            }}
          >
            <X size={12} />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <IconButton
          onClick={triggerFileInput}
          disabled={disabled}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
          aria-label="Anexar arquivo"
        >
          <Paperclip size={20} />
        </IconButton>
        <IconButton
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
          aria-label="Abrir câmera"
        >
          <Camera size={20} />
        </IconButton>
        <Tooltip title="Capturar do vídeo">
          <IconButton
            onClick={startWebcam}
            disabled={disabled}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
            aria-label="Capturar do vídeo"
          >
            <Video size={20} />
          </IconButton>
        </Tooltip>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Digite sua mensagem ou envie uma foto..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          size="small"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'surface.sunken',
              color: 'text.primary',
              '& textarea::placeholder': {
                color: 'text.secondary',
                opacity: 1,
              },
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={disabled || (!text.trim() && !imageFile)}
          sx={{
            backgroundColor: (!text.trim() && !imageFile)
              ? 'action.disabledBackground'
              : 'primary.main',
            color: (!text.trim() && !imageFile) ? 'text.disabled' : 'common.white',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'text.disabled',
            },
          }}
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </IconButton>
      </Box>

      {/* Webcam Dialog */}
      <Dialog
        open={webcamOpen}
        onClose={stopWebcam}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Video size={20} color="#2D6A4F" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Captura de Vídeo</Typography>
          </Box>
          <IconButton onClick={stopWebcam} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#000',
              mb: 2,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', display: 'block', borderRadius: 8 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Posicione a folha de soja no centro da câmera e clique para capturar.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CircleDot size={18} />}
              onClick={captureFrame}
              sx={{ px: 4 }}
            >
              Capturar Frame
            </Button>
            <Button
              variant="outlined"
              onClick={stopWebcam}
            >
              Cancelar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ChatInput;
