import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { MessageCircleQuestion } from 'lucide-react';

/**
 * Dialog renderizado quando o backend emite um interrupt (HITL) — TCC-059.
 *
 * Espera um payload com:
 *   - kind: 'ask_user'
 *   - question: pergunta em pt-br
 *   - response_kind: 'text' | 'choice' | 'boolean' | 'confirm'
 *   - options?: lista de strings (obrigatorio quando response_kind='choice')
 *
 * Ao submeter, chama `onSubmit(responseString)` — o orquestrador (useChat)
 * dispara `POST /api/v1/chat/resume` com `{thread_id, response}`.
 *
 * `onClose` eh chamado quando o usuario explicitamente cancela. Por design
 * o dialog NAO permite fechar via backdrop/Esc — interrupts precisam de
 * resposta consciente.
 */
function InterruptDialog({ open, interrupt, threadId, onSubmit, onClose, busy }) {
  const theme = useTheme();
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    // Limpa o input quando um novo interrupt chega.
    if (open) setTextValue('');
  }, [open, interrupt?.asked_at]);

  if (!interrupt) return null;

  const responseKind = interrupt.response_kind || 'text';
  const options = Array.isArray(interrupt.options) ? interrupt.options : [];

  const handleSubmit = (response) => {
    if (busy) return;
    onSubmit?.(response, threadId);
  };

  const handleTextSubmit = () => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    handleSubmit(trimmed);
  };

  const renderBody = () => {
    switch (responseKind) {
      case 'choice':
        return (
          <Stack spacing={1} sx={{ mt: 2 }} data-testid="interrupt-options">
            {options.map((opt) => (
              <Button
                key={opt}
                variant="outlined"
                size="large"
                disabled={busy}
                onClick={() => handleSubmit(opt)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2,
                  py: 1.25,
                }}
              >
                {opt}
              </Button>
            ))}
          </Stack>
        );
      case 'boolean':
        return (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 2, justifyContent: 'center' }}
            data-testid="interrupt-boolean"
          >
            <Button
              variant="contained"
              color="primary"
              disabled={busy}
              onClick={() => handleSubmit('sim')}
              sx={{ minWidth: 110, borderRadius: '10px', textTransform: 'none' }}
            >
              Sim
            </Button>
            <Button
              variant="outlined"
              disabled={busy}
              onClick={() => handleSubmit('nao')}
              sx={{ minWidth: 110, borderRadius: '10px', textTransform: 'none' }}
            >
              Não
            </Button>
          </Stack>
        );
      case 'confirm':
        return (
          <Stack sx={{ mt: 2, alignItems: 'center' }} data-testid="interrupt-confirm">
            <Button
              variant="contained"
              color="primary"
              disabled={busy}
              onClick={() => handleSubmit('ok')}
              sx={{ minWidth: 160, borderRadius: '10px', textTransform: 'none' }}
            >
              Continuar
            </Button>
          </Stack>
        );
      case 'text':
      default:
        return (
          <Stack spacing={1.5} sx={{ mt: 2 }} data-testid="interrupt-text">
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              value={textValue}
              disabled={busy}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
              placeholder="Sua resposta…"
              variant="outlined"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={busy || !textValue.trim()}
                onClick={handleTextSubmit}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                Enviar
              </Button>
            </Box>
          </Stack>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_evt, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        onClose?.();
      }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="interrupt-dialog-title"
    >
      <DialogTitle
        id="interrupt-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pb: 1 }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageCircleQuestion size={18} color={theme.palette.primary.main} />
        </Box>
        Preciso da sua confirmação
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.primary', fontWeight: 500 }}>
          {interrupt.question}
        </DialogContentText>
        {renderBody()}
      </DialogContent>
      {onClose && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            color="inherit"
            disabled={busy}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default InterruptDialog;
