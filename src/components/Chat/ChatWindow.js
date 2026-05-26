import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AnimatePresence } from 'framer-motion';
import { Camera, ImageIcon } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

function ChatWindow({ messages, isLoading, onSend, onSaveDiagnosis }) {
  const bottomRef = useRef(null);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const showWelcome = messages.length <= 1;
  const lastMsg = messages[messages.length - 1];
  const showQuickReplies = !isLoading && lastMsg?.role === 'assistant' && !!lastMsg?.diagnosis;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const stageAndSend = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) onSend('', file, 'ensemble');
    e.target.value = '';
  };

  return (
    <Box
      role="log"
      aria-label="Mensagens do chat"
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (t) => t.palette.surface.sunken,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { borderRadius: 4, backgroundColor: 'divider' },
      }}
    >
      <input type="file" accept=".jpg,.jpeg,.png,.webp" ref={galleryRef} onChange={stageAndSend} hidden />
      <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={stageAndSend} hidden />

      <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: 1100, mx: 'auto' }}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onSaveDiagnosis={onSaveDiagnosis} />
          ))}
        </AnimatePresence>

        {isLoading && <TypingIndicator />}

        {showWelcome && !isLoading && (
          <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1, pt: 3 }}>
            <Button onClick={() => cameraRef.current?.click()} variant="contained" color="secondary" size="large" startIcon={<Camera size={20} />} sx={{ justifyContent: 'center' }}>
              Tirar foto agora
            </Button>
            <Button onClick={() => galleryRef.current?.click()} variant="outlined" size="large" startIcon={<ImageIcon size={20} />} sx={{ justifyContent: 'center', borderColor: 'divider', color: 'text.primary', backgroundColor: 'background.paper' }}>
              Escolher da galeria
            </Button>
          </Box>
        )}

        {showQuickReplies && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: '38px', mt: -1, mb: 1 }}>
            <Button onClick={() => cameraRef.current?.click()} size="small" variant="contained" color="secondary" startIcon={<Camera size={14} />} sx={{ borderRadius: 999, py: 0.5 }}>
              Mandar outra foto
            </Button>
          </Box>
        )}
      </Box>

      <div ref={bottomRef} />
    </Box>
  );
}

export default ChatWindow;
