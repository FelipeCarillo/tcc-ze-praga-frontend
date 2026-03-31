import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import QuickSuggestions from './QuickSuggestions';

function ChatWindow({ messages, isLoading, onSend, onUploadClick, onSaveDiagnosis }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showSuggestions = messages.length <= 1;

  return (
    <Box
      role="log"
      aria-label="Mensagens do chat"
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: { xs: 2, md: 3 },
        backgroundColor: 'background.default',
      }}
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onSaveDiagnosis={onSaveDiagnosis}
        />
      ))}

      {showSuggestions && !isLoading && (
        <QuickSuggestions onSend={onSend} onUploadClick={onUploadClick} />
      )}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </Box>
  );
}

export default ChatWindow;
