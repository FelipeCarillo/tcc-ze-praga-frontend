import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { SquarePen } from 'lucide-react';
import SessionsList, { useSessions } from './SessionsList';

/**
 * Conversas anteriores no celular (o ícone do cabeçalho do m-Chat). No desktop
 * a mesma lista fica fixa na lateral escura (d-Chat).
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSelect: (sessionId: string) => void,
 *   onNew: () => void,
 *   currentSessionId: string|null,
 * }} props
 */
function SessionsDrawer({ open, onClose, onSelect, onNew, currentSessionId }) {
  // Recarrega a cada abertura: uma conversa pode ter avançado desde a última.
  const { sessions, loading, error } = useSessions(open);

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 290, sm: 330 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 800, fontStretch: '110%', fontSize: '1.0625rem', mb: 1.5 }}>
            Suas conversas
          </Typography>
          <Button
            fullWidth
            onClick={() => {
              onNew();
              onClose();
            }}
            startIcon={<SquarePen size={16} />}
            sx={{ height: 48, borderRadius: '14px', fontWeight: 800, bgcolor: 'cta.main', color: 'cta.contrastText', '&:hover': { bgcolor: 'cta.hover' } }}
          >
            Nova conversa
          </Button>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
          <SessionsList
            sessions={sessions}
            loading={loading}
            error={error}
            currentSessionId={currentSessionId}
            onSelect={(id) => {
              onSelect(id);
              onClose();
            }}
          />
        </Box>
      </Box>
    </Drawer>
  );
}

export default SessionsDrawer;
