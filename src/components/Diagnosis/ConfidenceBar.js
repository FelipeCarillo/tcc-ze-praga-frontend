import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

function getColor(confidence) {
  if (confidence >= 0.85) return 'success';
  if (confidence >= 0.7) return 'warning';
  return 'error';
}

function ConfidenceBar({ confidence }) {
  const percentage = Math.round(confidence * 100);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Confianca do modelo
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {percentage}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={getColor(confidence)}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
}

export default ConfidenceBar;
