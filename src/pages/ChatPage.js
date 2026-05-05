import React, { useState, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { History, Leaf, SquarePen } from 'lucide-react';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import DragDropOverlay from '../components/Chat/DragDropOverlay';
import useChat from '../hooks/useChat';
import { saveDiagnosis } from '../services/historyService';

function ChatPage() {
  const theme = useTheme();
  const { messages, isLoading, send, clearChat } = useChat();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputTrigger = useRef(null);

  const handleSaveDiagnosis = useCallback(async (diagnosis) => {
    try {
      await saveDiagnosis(diagnosis);
      setSnackbar({ open: true, message: 'Diagnóstico salvo no histórico!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar o diagnóstico.', severity: 'error' });
    }
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) send('', file, 'ensemble');
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        maxWidth: 860,
        mx: 'auto',
        width: '100%',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragDropOverlay visible={isDragging} />

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, md: 3 },
          py: 1.25,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.88),
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.6),
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '9px',
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Leaf size={15} color="white" strokeWidth={2} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '0.95rem' }}
          >
            Zé Praga
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.2,
              borderRadius: '6px',
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              border: '1px solid',
              borderColor: alpha(theme.palette.success.main, 0.2),
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'success.main',
                fontWeight: 700,
                fontSize: '0.62rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              IA Agrícola
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Histórico de diagnósticos">
            <IconButton
              component={Link}
              to="/historico"
              size="small"
              sx={{
                color: 'text.secondary',
                borderRadius: '8px',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <History size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Nova conversa">
            <IconButton
              onClick={clearChat}
              size="small"
              sx={{
                color: 'text.secondary',
                borderRadius: '8px',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <SquarePen size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSend={send}
        onUploadClick={() => fileInputTrigger.current?.click()}
        onSaveDiagnosis={handleSaveDiagnosis}
      />

      <ChatInput onSend={send} disabled={isLoading} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '10px', fontWeight: 500 }}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChatPage;
