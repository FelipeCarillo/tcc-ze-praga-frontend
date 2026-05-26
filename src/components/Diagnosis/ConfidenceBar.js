import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function confidenceToken(theme, confidence) {
  if (confidence >= 0.9) return theme.palette.severity.nenhuma;
  if (confidence >= 0.7) return theme.palette.severity.baixa;
  if (confidence >= 0.5) return theme.palette.severity.media;
  return theme.palette.severity.alta;
}

function confidenceLabel(confidence) {
  if (confidence >= 0.9) return 'Confiança alta';
  if (confidence >= 0.7) return 'Confiança média';
  return 'Confiança baixa';
}

/** Número grande à esquerda + barra à direita (auditoria, seção 13). */
function ConfidenceBar({ confidence }) {
  const percentage = (confidence * 100).toFixed(1).replace('.', ',');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2.5, backgroundColor: (t) => t.palette.surface.sunken }}>
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.8rem', color: 'primary.main', lineHeight: 1 }}>
        {percentage.split(',')[0]}
        <Box component="span" sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>%</Box>
      </Typography>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{confidenceLabel(confidence)}</Typography>
        <Box sx={{ height: 6, bgcolor: 'rgba(28,42,32,0.06)', borderRadius: 999, overflow: 'hidden', mt: 0.5 }}>
          <Box
            sx={{
              height: '100%',
              width: `${Math.min(confidence * 100, 100)}%`,
              background: (t) => `linear-gradient(90deg, ${confidenceToken(t, confidence)}, ${t.palette.secondary.main})`,
              transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ConfidenceBar;
