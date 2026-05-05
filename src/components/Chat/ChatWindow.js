import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import QuickSuggestions from './QuickSuggestions';

function ChatWindow({ messages, isLoading, onSend, onUploadClick, onSaveDiagnosis }) {
  const bottomRef = useRef(null);
  const showWelcome = messages.length <= 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <Box
      role="log"
      aria-label="Mensagens do chat"
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        scrollbarWidth: 'thin',
        scrollbarColor: (theme) => `${theme.palette.divider} transparent`,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: 4,
          backgroundColor: 'divider',
        },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
      }}
    >
      {showWelcome ? (
        <QuickSuggestions onSend={onSend} onUploadClick={onUploadClick} />
      ) : (
        <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSaveDiagnosis={onSaveDiagnosis}
              />
            ))}
          </AnimatePresence>

          {isLoading && <TypingIndicator />}
        </Box>
      )}

      {/* Loading state during welcome */}
      {showWelcome && isLoading && (
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
          <TypingIndicator />
        </Box>
      )}

      <div ref={bottomRef} />
    </Box>
  );
}

export default ChatWindow;
