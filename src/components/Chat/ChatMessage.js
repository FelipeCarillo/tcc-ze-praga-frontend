import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import BugReportIcon from '@mui/icons-material/BugReport';
import PersonIcon from '@mui/icons-material/Person';

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

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {!isUser && (
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          <BugReportIcon fontSize="small" />
        </Avatar>
      )}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '75%',
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'white' : 'text.primary',
          borderRadius: 2,
          borderTopLeftRadius: isUser ? 16 : 4,
          borderTopRightRadius: isUser ? 4 : 16,
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
              borderRadius: 1,
              mb: 1,
              display: 'block',
            }}
          />
        )}
        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
          {formatContent(message.content)}
        </Typography>
      </Paper>
      {isUser && (
        <Avatar sx={{ bgcolor: 'grey.600', width: 36, height: 36 }}>
          <PersonIcon fontSize="small" />
        </Avatar>
      )}
    </Box>
  );
}

export default ChatMessage;
