import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Camera, HelpCircle, Info } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

const suggestions = [
  { label: 'Enviar foto da folha', icon: Camera, action: 'upload' },
  { label: 'O que você detecta?', icon: HelpCircle },
  { label: 'Como funciona?', icon: Info },
];

function QuickSuggestions({ onSend, onUploadClick }) {
  const isDark = useDarkMode();

  const handleClick = (suggestion) => {
    if (suggestion.action === 'upload' && onUploadClick) {
      onUploadClick();
    } else {
      onSend(suggestion.label);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
        py: 2,
      }}
    >
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon;
        return (
          <Chip
            key={suggestion.label}
            icon={<Icon size={16} />}
            label={suggestion.label}
            onClick={() => handleClick(suggestion)}
            variant="outlined"
            sx={{
              borderColor: isDark ? '#2D3B35' : 'primary.light',
              color: isDark ? '#E8F5E9' : 'primary.main',
              backgroundColor: isDark ? '#132218' : 'transparent',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(45, 106, 79, 0.22)' : 'rgba(45, 106, 79, 0.08)',
                borderColor: isDark ? '#52B788' : 'primary.main',
              },
              '& .MuiChip-icon': {
                color: isDark ? '#9ED8B8' : 'primary.main',
              },
            }}
          />
        );
      })}
    </Box>
  );
}

export default QuickSuggestions;
