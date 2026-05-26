import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';

const SEV_TOKEN = { alta: 'alta', media: 'media', baixa: 'baixa', nenhuma: 'nenhuma' };
const SEV_MARK = { alta: '!', media: '~', baixa: '~', nenhuma: '✓' };

function HistoryItem({ diagnosis, onOpen, selectionMode, selected, onToggle }) {
  const token = SEV_TOKEN[diagnosis.severity] || 'media';
  const time = diagnosis.timestamp
    ? new Date(diagnosis.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';
  const conf = diagnosis.confidence != null ? `${(diagnosis.confidence * 100).toFixed(0)}%` : '';

  return (
    <Box
      onClick={() => (selectionMode ? onToggle(diagnosis.id) : onOpen(diagnosis.id))}
      sx={{
        display: 'flex',
        gap: 1.25,
        alignItems: 'center',
        p: 1.25,
        mb: 1,
        borderRadius: 3,
        cursor: 'pointer',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        transition: 'border-color 0.15s, transform 0.15s',
        '&:hover': { transform: 'translateY(-1px)' },
      }}
    >
      {selectionMode && (
        <Checkbox checked={!!selected} size="small" sx={{ p: 0.5 }} onClick={(e) => e.stopPropagation()} onChange={() => onToggle(diagnosis.id)} />
      )}

      <Box sx={{ position: 'relative', width: 48, height: 48, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(160deg,#74C69D,#1F5A3D)' }}>
        {diagnosis.imageUrl && (
          <Box component="img" src={diagnosis.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        <Box sx={{ position: 'absolute', bottom: -3, right: -3, width: 18, height: 18, borderRadius: '50%', border: '2px solid', borderColor: 'background.paper', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.6rem', fontWeight: 700, bgcolor: (t) => t.palette.severity[token] }}>
          {SEV_MARK[diagnosis.severity] || '~'}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }} noWrap>
          {diagnosis.disease}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.25 }} noWrap>
          {[time, conf].filter(Boolean).join(' · ')}
        </Typography>
        <Box sx={{ height: 3, bgcolor: 'rgba(28,42,32,0.06)', borderRadius: 999, mt: 0.75, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${Math.min((diagnosis.confidence || 0) * 100, 100)}%`, bgcolor: (t) => t.palette.severity[token] }} />
        </Box>
      </Box>
    </Box>
  );
}

export default HistoryItem;
