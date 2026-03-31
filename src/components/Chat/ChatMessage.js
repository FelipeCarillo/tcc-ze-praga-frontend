import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Leaf, User } from 'lucide-react';
import DiagnosisCard from './DiagnosisCard';
import { useDarkMode } from '../../hooks/useDarkMode';

function formatContent(text) {
  if (!text) return '';
  return text.split('\n').map((line, i) => {
    const boldFormatted = line.replace(
      /\*\*(.+?)\*\*/g,
      '<strong>$1</strong>'
    );
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        {i < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

function ChatMessage({ message, onSaveDiagnosis }) {
  const isUser = message.role === 'user';
  const isDark = useDarkMode();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        gap: 1.5,
        alignItems: 'flex-end',
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 36,
            height: 36,
            flexShrink: 0,
          }}
        >
          <Leaf size={18} color="white" />
        </Avatar>
      )}
      <Box sx={{ maxWidth: '75%' }}>
        <Box
          sx={{
            p: 2,
            backgroundColor: isUser
              ? (isDark ? '#1A3A27' : '#E8F5E9')
              : (isDark ? '#132218' : '#FFFFFF'),
            color: isDark ? '#E8F5E9' : 'text.primary',
            borderRadius: isUser
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            border: isUser ? 'none' : `1px solid ${isDark ? '#2D3B35' : '#E5E7EB'}`,
            boxShadow: isUser ? 'none' : (isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'),
          }}
        >
          {message.imageUrl && (
            <Box
              component="img"
              src={message.imageUrl}
              alt="Imagem enviada para analise"
              sx={{
                maxWidth: '100%',
                maxHeight: 220,
                borderRadius: 2,
                mb: message.content ? 1 : 0,
                display: 'block',
                cursor: 'pointer',
              }}
            />
          )}
          {message.content && (
            <Typography
              variant="body2"
              component="div"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
            >
              {formatContent(message.content)}
            </Typography>
          )}
        </Box>

        {message.diagnosis && (
          <DiagnosisCard
            diagnosis={message.diagnosis}
            onSave={onSaveDiagnosis}
          />
        )}

        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            mt: 0.5,
            display: 'block',
            textAlign: isUser ? 'right' : 'left',
            fontSize: '0.7rem',
            px: 0.5,
          }}
        >
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
      {isUser && (
        <Avatar
          sx={{
            bgcolor: '#6B7280',
            width: 36,
            height: 36,
            flexShrink: 0,
          }}
        >
          <User size={18} color="white" />
        </Avatar>
      )}
    </Box>
  );
}

export default ChatMessage;
