import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';
import DiagnosisCard from './DiagnosisCard';
import Markdown from '../common/Markdown';

function ChatMessage({ message, onSaveDiagnosis }) {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const isDark = theme.palette.mode === 'dark';

  const renderAssistantContent = () => {
    if (!message.content) return null;
    if (message.isStreaming) {
      return (
        <Typography
          variant="body2"
          component="div"
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}
        >
          {message.content}
        </Typography>
      );
    }
    return (
      <Box sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
        <Markdown>{message.content}</Markdown>
      </Box>
    );
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', mb: 2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '82%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {!isUser && (
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
            <Marca style={{ width: 30, height: 30, display: 'block' }} />
          </Box>
        )}

        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            backgroundColor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? '#FFFFFF' : 'text.primary',
            border: isUser ? 'none' : '1px solid',
            borderColor: 'divider',
            boxShadow: isUser ? 'none' : (t) => `0 1px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(28,42,32,0.06)'}`,
          }}
        >
          {message.imageUrl && (
            <Box
              component="img"
              src={message.imageUrl}
              alt="Imagem enviada"
              sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: '10px', display: 'block', mb: message.content ? 1 : 0, objectFit: 'cover' }}
            />
          )}
          {isUser ? (
            message.content && (
              <Typography
                variant="body2"
                component="div"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}
              >
                {message.content}
              </Typography>
            )
          ) : (
            renderAssistantContent()
          )}
        </Box>
      </Box>

      {!isUser && message.diagnosis && (
        <Box sx={{ maxWidth: '82%', width: '100%', pl: '38px' }}>
          <DiagnosisCard diagnosis={message.diagnosis} onSave={onSaveDiagnosis} />
        </Box>
      )}

      <Typography
        variant="caption"
        sx={{ color: 'text.disabled', fontSize: '0.66rem', mt: 0.5, px: isUser ? 0.5 : '38px' }}
      >
        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Box>
  );
}

export default ChatMessage;
