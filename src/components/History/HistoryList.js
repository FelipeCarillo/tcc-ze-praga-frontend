import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HistoryCard from './HistoryCard';
import InboxIcon from '@mui/icons-material/Inbox';

function HistoryList({ diagnoses, onDelete }) {
  if (diagnoses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <InboxIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Nenhum diagnostico salvo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Faca uma analise na pagina inicial e salve o resultado.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {diagnoses.map((diagnosis) => (
        <HistoryCard
          key={diagnosis.id}
          diagnosis={diagnosis}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}

export default HistoryList;
