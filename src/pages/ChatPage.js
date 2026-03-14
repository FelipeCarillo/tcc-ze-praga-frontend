import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SaveIcon from '@mui/icons-material/Save';
import Tooltip from '@mui/material/Tooltip';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import useChat from '../hooks/useChat';
import { saveDiagnosis } from '../services/historyService';

function ChatPage() {
  const { messages, isLoading, send, clearChat } = useChat();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleSaveDiagnosis = async (diagnosis) => {
    try {
      await saveDiagnosis(diagnosis);
      setSnackbar({ open: true, message: 'Diagnostico salvo no historico!' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar.' });
    }
  };

  const lastDiagnosis = [...messages]
    .reverse()
    .find((m) => m.diagnosis)?.diagnosis;

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 2,
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        {lastDiagnosis && (
          <Tooltip title="Salvar ultimo diagnostico">
            <IconButton
              color="primary"
              onClick={() => handleSaveDiagnosis(lastDiagnosis)}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Limpar conversa">
          <IconButton onClick={clearChat} color="error">
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper
        elevation={2}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <ChatWindow messages={messages} isLoading={isLoading} />
      </Paper>

      <ChatInput onSend={send} disabled={isLoading} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Container>
  );
}

export default ChatPage;
