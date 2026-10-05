import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { ArrowUp, HelpCircle } from 'lucide-react';

/**
 * Pergunta que o agente fez via `ask_user` (human-in-the-loop).
 *
 * O backend já resolvia o ciclo inteiro — interrupt → snapshot no checkpointer
 * → POST /chat/resume — mas a UI ignorava o evento SSE `interrupt` e o balão
 * ficava travado. Sem esta tela a tool precisava ficar desligada por
 * kill-switch (`agent_enable_ask_user`).
 *
 * O formato da resposta segue `responseKind`:
 *   - `choice`  → um botão por opção
 *   - `boolean` → Sim / Não
 *   - `confirm` → um único "Pode seguir"
 *   - `text`    → campo livre (default)
 *
 * @param {{ interrupt: object, onAnswer: (resposta: string) => void, disabled?: boolean }} props
 */
function InterruptPrompt({ interrupt, onAnswer, disabled = false }) {
  const [text, setText] = useState('');
  if (!interrupt) return null;

  const { question, responseKind, options } = interrupt;

  const answer = (value) => {
    if (disabled || !value) return;
    onAnswer(value);
    setText('');
  };

  const quickOptions = (() => {
    if (responseKind === 'choice' && Array.isArray(options) && options.length) {
      return options;
    }
    if (responseKind === 'boolean') return ['Sim', 'Não'];
    if (responseKind === 'confirm') return ['Pode seguir'];
    return null;
  })();

  // m-Chat: a pergunta num balão branco do Zé e as respostas em pílulas com
  // contorno verde-lavoura logo abaixo (sem avatar, como as outras mensagens).
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5, alignSelf: 'flex-start', maxWidth: { xs: '88%', md: '78%' } }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '20px 20px 20px 6px',
          px: 1.75,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, color: 'primary.main' }}>
          <HelpCircle size={13} aria-hidden="true" />
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.06em' }}>O ZÉ PERGUNTA</Typography>
        </Box>
        <Typography sx={{ lineHeight: 1.45, fontSize: '0.9375rem' }}>{question}</Typography>
      </Box>

      {quickOptions ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {quickOptions.map((opt) => (
            <Box
              key={opt}
              component="button"
              type="button"
              onClick={() => answer(opt)}
              disabled={disabled}
              sx={{
                height: 40,
                px: 1.75,
                border: '1.5px solid',
                borderColor: 'primary.main',
                borderRadius: 999,
                bgcolor: 'background.paper',
                color: 'primary.main',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '&:disabled': { opacity: 0.5, cursor: 'default' },
              }}
            >
              {opt}
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            answer(text.trim());
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', border: '1.5px solid', borderColor: 'primary.main', borderRadius: 999, pl: 2, pr: 0.5, height: 44 }}
        >
          <InputBase
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Responder…"
            disabled={disabled}
            autoFocus
            inputProps={{ 'aria-label': question }}
            sx={{ flex: 1, fontSize: '0.9375rem' }}
          />
          <Button
            type="submit"
            disabled={disabled || !text.trim()}
            aria-label="Enviar resposta"
            sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <ArrowUp size={17} />
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default InterruptPrompt;
