import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import DiagnosisCard from './DiagnosisCard';

function renderContent(text) {
  if (!text) return null;
  return text.split('\n').map((line, i, arr) => {
    const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function ChatMessage({ message, onSaveDiagnosis }) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          maxWidth: '82%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Bot avatar */}
        {!isUser && (
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
              mb: '2px',
            }}
          >
            <Leaf size={14} color="white" strokeWidth={2} />
          </Box>
        )}

        {/* Bubble */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: isUser
              ? '16px 16px 4px 16px'
              : '4px 16px 16px 16px',
            backgroundColor: isUser
              ? theme.palette.mode === 'dark'
                ? theme.palette.primary.dark
                : alpha(theme.palette.primary.main, 0.12)
              : 'background.paper',
            border: '1px solid',
            borderColor: isUser
              ? theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.light, 0.2)
                : alpha(theme.palette.primary.main, 0.2)
              : 'divider',
            boxShadow: isUser
              ? 'none'
              : `0 1px 8px ${alpha(theme.palette.common.black, 0.06)}`,
          }}
        >
          {message.imageUrl && (
            <Box
              component="img"
              src={message.imageUrl}
              alt="Imagem enviada"
              sx={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: '10px',
                display: 'block',
                mb: message.content ? 1 : 0,
                objectFit: 'cover',
              }}
            />
          )}
          {message.content && (
            <Typography
              variant="body2"
              component="div"
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.65,
                fontSize: '0.875rem',
                color: isUser
                  ? theme.palette.mode === 'dark'
                    ? theme.palette.primary.light
                    : theme.palette.primary.dark
                  : 'text.primary',
              }}
            >
              {renderContent(message.content)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Diagnosis card (below bot message, full width of the message area) */}
      {!isUser && message.diagnosis && (
        <Box sx={{ maxWidth: '82%', width: '100%', pl: '42px' }}>
          <DiagnosisCard diagnosis={message.diagnosis} onSave={onSaveDiagnosis} />
        </Box>
      )}

      {/* Timestamp */}
      <Typography
        variant="caption"
        sx={{
          color: 'text.disabled',
          fontSize: '0.68rem',
          mt: 0.5,
          px: isUser ? 0.5 : '42px',
        }}
      >
        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Box>
  );
}

export default ChatMessage;
