import React, { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { MessageSquare, SquarePen } from 'lucide-react';
import { listSessions } from '../../services/sessionsService';

/**
 * Lista de conversas anteriores.
 *
 * O backend persistia `chat_sessions`/`chat_messages` desde sempre, mas não
 * havia leitura: o chat recomeçava do zero a cada reload. Este drawer consome
 * GET /sessions e devolve o `id` escolhido para `useChat.loadSession`.
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
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setSessions(await listSessions());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega a cada abertura: uma conversa pode ter avançado desde a última.
  useEffect(() => {
    if (open) reload();
  }, [open, reload]);

  const relativeDate = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();
    return sameDay
      ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 290, sm: 330 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 800, fontSize: '1rem', mb: 1.5 }}>
            Suas conversas
          </Typography>
          <Button
            fullWidth
            onClick={() => {
              onNew();
              onClose();
            }}
            variant="outlined"
            size="small"
            startIcon={<SquarePen size={15} />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.primary' }}
          >
            Nova conversa
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={22} />
            </Box>
          )}

          {!loading && error && (
            <Typography variant="body2" sx={{ color: 'text.secondary', px: 1, py: 2 }}>
              Não consegui carregar suas conversas agora.
            </Typography>
          )}

          {!loading && !error && sessions.length === 0 && (
            <Box sx={{ px: 1, py: 3, textAlign: 'center' }}>
              <MessageSquare size={22} style={{ opacity: 0.4 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.5 }}>
                Ainda não temos conversa nenhuma. Manda a primeira foto que eu começo a anotar.
              </Typography>
            </Box>
          )}

          {!loading &&
            !error &&
            sessions.map((s) => {
              const isCurrent = s.id === currentSessionId;
              return (
                <Box
                  key={s.id}
                  onClick={() => {
                    onSelect(s.id);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelect(s.id);
                      onClose();
                    }
                  }}
                  sx={{
                    p: 1.25,
                    mb: 0.75,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isCurrent ? 'secondary.main' : 'divider',
                    backgroundColor: isCurrent ? 'action.selected' : 'background.paper',
                    '&:hover': { borderColor: 'secondary.main' },
                  }}
                >
                  <Typography
                    sx={{ fontSize: '0.83rem', fontWeight: 600, lineHeight: 1.35 }}
                    noWrap
                  >
                    {s.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.25 }}>
                    {[relativeDate(s.updatedAt), `${s.messageCount} msgs`]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </Box>
              );
            })}
        </Box>
      </Box>
    </Drawer>
  );
}

export default SessionsDrawer;
