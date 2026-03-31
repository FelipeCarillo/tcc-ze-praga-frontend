import React, { useState, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, History, Plus } from 'lucide-react';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import DragDropOverlay from '../components/Chat/DragDropOverlay';
import useChat from '../hooks/useChat';
import { saveDiagnosis } from '../services/historyService';
import { useDarkMode } from '../hooks/useDarkMode';

function ChatPage() {
  const isDark = useDarkMode();
  const { messages, isLoading, send, clearChat } = useChat();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleSaveDiagnosis = useCallback(async (diagnosis) => {
    try {
      await saveDiagnosis(diagnosis);
      setSnackbar({ open: true, message: 'Diagnóstico salvo no histórico!' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar.' });
    }
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      send('', file, 'ensemble');
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        maxWidth: 900,
        mx: 'auto',
        width: '100%',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragDropOverlay visible={isDragging} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${isDark ? '#2D3B35' : '#E5E7EB'}`,
          backgroundColor: isDark ? '#132218' : '#FFFFFF',
        }}
      >
        <IconButton
          component={Link}
          to="/"
          size="small"
          sx={{ color: 'text.secondary' }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </IconButton>
        <Leaf size={22} color="#2D6A4F" />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', flex: 1 }}>
          Zé Praga
        </Typography>
        <Tooltip title="Histórico">
          <IconButton
            component={Link}
            to="/historico"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <History size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Novo chat">
          <IconButton
            onClick={clearChat}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <Plus size={20} />
          </IconButton>
        </Tooltip>
      </Box>

      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSend={send}
        onSaveDiagnosis={handleSaveDiagnosis}
      />

      <ChatInput onSend={send} disabled={isLoading} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

export default ChatPage;
