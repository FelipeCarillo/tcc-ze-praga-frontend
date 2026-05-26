import React, { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { History, SquarePen, ChevronLeft } from 'lucide-react';
import { ReactComponent as Marca } from '../assets/brand/marca.svg';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import DragDropOverlay from '../components/Chat/DragDropOverlay';
import useChat from '../hooks/useChat';
import { saveDiagnosis } from '../services/historyService';
import { copy } from '../copy/ze';

function ChatPage() {
  const { messages, isLoading, send, clearChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Foto vinda do CameraFAB (state da navegação) — envia automaticamente uma vez.
  const pendingHandled = useRef(false);
  useEffect(() => {
    const file = location.state?.pendingFile;
    if (file && !pendingHandled.current) {
      pendingHandled.current = true;
      send('', file, 'ensemble');
      window.history.replaceState({}, '');
    }
  }, [location.state, send]);

  const handleSaveDiagnosis = useCallback(async (diagnosis) => {
    try {
      await saveDiagnosis(diagnosis);
      setSnackbar({ open: true, message: copy.feedback.saved, severity: 'success' });
      window.dispatchEvent(new CustomEvent('diagnosis-saved'));
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
      sx={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', backgroundColor: 'background.paper' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragDropOverlay visible={isDragging} />

      {/* Header slim */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1.5, md: 2 },
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <IconButton component={Link} to="/" size="small" aria-label="Voltar" sx={{ color: 'text.secondary' }}>
          <ChevronLeft size={20} />
        </IconButton>
        <Box sx={{ width: 32, height: 32, borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
          <Marca style={{ width: 32, height: 32, display: 'block' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1 }}>
            Zé
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: isLoading ? 'secondary.main' : 'success.main' }}>
            ● {isLoading ? copy.chat.statusLooking : copy.chat.statusHere}
          </Typography>
        </Box>
        <Tooltip title="Histórico">
          <IconButton component={Link} to="/historico" size="small" sx={{ color: 'text.secondary' }}>
            <History size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Nova conversa">
          <IconButton onClick={clearChat} size="small" sx={{ color: 'text.secondary' }}>
            <SquarePen size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      <ChatWindow messages={messages} isLoading={isLoading} onSend={send} onSaveDiagnosis={handleSaveDiagnosis} />

      <ChatInput onSend={send} disabled={isLoading} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2.5, fontWeight: 500 }} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChatPage;
