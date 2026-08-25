import React, { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { Link, useLocation } from 'react-router-dom';
import { History, SquarePen, ChevronLeft, MessagesSquare } from 'lucide-react';
import { ReactComponent as Marca } from '../assets/brand/marca.svg';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import DragDropOverlay from '../components/Chat/DragDropOverlay';
import SessionsDrawer from '../components/Chat/SessionsDrawer';
import useChat from '../hooks/useChat';
import { useFeatures } from '../contexts/FeaturesContext';
import { defaultModelId } from '../data/diagnosisModels';
import { saveDiagnosis } from '../services/historyService';
import { copy } from '../copy/ze';

function ChatPage() {
  // Usa o caminho de streaming (SSE) — sem o teto de 30s do axios, com
  // session_id (memória server-side) e tokens incrementais. Aliasado como
  // `send` porque a assinatura é idêntica à do `send` síncrono.
  const {
    messages,
    isLoading,
    pendingInterrupt,
    sendStreaming: send,
    answerInterrupt,
    loadSession,
    clearChat,
    sessionId,
  } = useChat();
  // CameraFAB e drag & drop entram sem passar pelo seletor de modelo.
  const features = useFeatures();
  const fallbackModel = defaultModelId(features);
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isDragging, setIsDragging] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const dragCounter = useRef(0);

  // Foto vinda do CameraFAB (state da navegação) — envia automaticamente uma vez.
  const pendingHandled = useRef(false);
  useEffect(() => {
    const file = location.state?.pendingFile;
    if (file && !pendingHandled.current) {
      pendingHandled.current = true;
      send('', file, fallbackModel);
      window.history.replaceState({}, '');
    }
  }, [location.state, send, fallbackModel]);

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
    if (file?.type.startsWith('image/')) send('', file, fallbackModel);
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

      <SessionsDrawer
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        onSelect={loadSession}
        onNew={clearChat}
        currentSessionId={sessionId}
      />

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
        <Tooltip title="Conversas anteriores">
          <IconButton
            onClick={() => setSessionsOpen(true)}
            size="small"
            aria-label="Conversas anteriores"
            sx={{ color: 'text.secondary' }}
          >
            <MessagesSquare size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Histórico de diagnósticos">
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

      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSend={send}
        onSaveDiagnosis={handleSaveDiagnosis}
        pendingInterrupt={pendingInterrupt}
        onAnswerInterrupt={answerInterrupt}
      />

      {/* Com pergunta pendente o composer sai de cena: escrever ali mandaria
          uma mensagem nova em vez de retomar o turno pausado. */}
      <ChatInput onSend={send} disabled={isLoading || !!pendingInterrupt} />

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
