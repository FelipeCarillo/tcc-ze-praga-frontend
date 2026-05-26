import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Camera } from 'lucide-react';
import { copy } from '../../copy/ze';

function EmptyState() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 8, px: 3 }}>
      <Box component="svg" viewBox="0 0 120 120" sx={{ width: 120, mb: 1.5 }} xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="54" fill="var(--papel-2)" />
        <defs>
          <linearGradient id="emph" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A8C99B" />
            <stop offset="100%" stopColor="#4A6B3D" />
          </linearGradient>
        </defs>
        <rect x="36" y="40" width="48" height="56" rx="6" fill="#F4EEDF" stroke="#1F5A3D" strokeWidth="1.4" />
        <line x1="44" y1="56" x2="76" y2="56" stroke="#1F5A3D" strokeWidth="1" opacity="0.4" />
        <line x1="44" y1="66" x2="70" y2="66" stroke="#1F5A3D" strokeWidth="1" opacity="0.4" />
        <line x1="44" y1="76" x2="74" y2="76" stroke="#1F5A3D" strokeWidth="1" opacity="0.4" />
        <path d="M82 28 Q72 36 70 50 Q74 60 84 56 Q90 50 88 38 Q86 30 82 28 Z" fill="url(#emph)" stroke="#1F5A3D" strokeWidth="1" />
      </Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>{copy.history.emptyTitle}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260, mb: 2.5 }}>
        {copy.history.emptyDesc}
      </Typography>
      <Button component={Link} to="/chat" variant="contained" color="secondary" startIcon={<Camera size={18} />}>
        Mandar primeira foto
      </Button>
    </Box>
  );
}

export default EmptyState;
