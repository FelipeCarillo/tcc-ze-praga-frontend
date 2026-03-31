import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { Leaf } from 'lucide-react';

const dotStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: '#9CA3AF',
  display: 'inline-block',
  animation: 'bounce 1.4s infinite ease-in-out both',
};

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-end' }}>
      <Avatar
        sx={{
          bgcolor: 'primary.main',
          width: 36,
          height: 36,
        }}
      >
        <Leaf size={18} color="white" />
      </Avatar>
      <Box
        sx={{
          backgroundColor: 'chat.bot',
          borderRadius: '18px 18px 18px 4px',
          px: 2.5,
          py: 2,
          display: 'flex',
          gap: 0.6,
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            ...dotStyle,
            animationDelay: '-0.32s',
            '@keyframes bounce': {
              '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
              '40%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        />
        <Box
          sx={{
            ...dotStyle,
            animationDelay: '-0.16s',
            '@keyframes bounce': {
              '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
              '40%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        />
        <Box
          sx={{
            ...dotStyle,
            animationDelay: '0s',
            '@keyframes bounce': {
              '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
              '40%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default TypingIndicator;
