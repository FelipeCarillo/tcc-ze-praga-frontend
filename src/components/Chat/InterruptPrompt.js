import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { ArrowUp, HelpCircle } from 'lucide-react';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';

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

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}
    >
      <Box sx={{ width: 30, height: 30, borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
        <Marca style={{ width: 30, height: 30, display: 'block' }} />
      </Box>

      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'secondary.main',
          borderRadius: '4px 16px 16px 16px',
          p: 1.75,
          maxWidth: '82%',
          flex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, color: 'secondary.main' }}>
          <HelpCircle size={13} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.3 }}>
            O ZÉ PERGUNTA
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem', mb: 1.5 }}>
          {question}
        </Typography>

        {quickOptions ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickOptions.map((opt) => (
              <Button
                key={opt}
                onClick={() => answer(opt)}
                disabled={disabled}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'secondary.main', color: 'secondary.main' },
                }}
              >
                {opt}
              </Button>
            ))}
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              answer(text.trim());
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'surface.sunken',
              borderRadius: 999,
              px: 1.5,
              py: 0.5,
            }}
          >
            <InputBase
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Responder…"
              disabled={disabled}
              autoFocus
              inputProps={{ 'aria-label': question }}
              sx={{ flex: 1, fontSize: '0.88rem' }}
            />
            <Button
              type="submit"
              disabled={disabled || !text.trim()}
              aria-label="Enviar resposta"
              sx={{ minWidth: 34, width: 34, height: 34, borderRadius: '50%', p: 0 }}
            >
              <ArrowUp size={17} />
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default InterruptPrompt;
