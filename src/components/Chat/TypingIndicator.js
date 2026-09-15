import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion, useReducedMotion } from 'framer-motion';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';
import { copy } from '../../copy/ze';

/**
 * Skeleton do estado "Zé pensando" (auditoria, seção 11): bolha do Zé com um
 * spinner pequeno + microcopy em efeito de máquina de escrever + placeholders
 * de linha. A frase aparece, pausa, apaga e então dá lugar à próxima.
 * Quebra a frieza de "Analisando…" e mantém a voz.
 *
 * Quando o agente está rodando uma ferramenta (`toolCall`), a microcopy genérica
 * dá lugar ao que ele está de fato fazendo — a inferência ONNX segura ~1,2s no
 * ensemble, e antes disso o balão ficava mudo sem explicação.
 *
 * @param {{ toolCall?: string|null }} props nome técnico da tool em execução
 */
function TypingIndicator({ toolCall = null }) {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('typing');
  const reducedMotion = useReducedMotion();
  const phrases = copy.chat.thinking;

  useEffect(() => {
    // Uma tool descreve um trabalho específico; não devemos digitar/apagar
    // esse estado real. Ao voltar ao modo genérico, recomeçamos o ciclo.
    setIdx(0);
    setTyped('');
    setPhase('typing');
  }, [toolCall]);

  useEffect(() => {
    if (toolCall || reducedMotion) return undefined;

    const phrase = phrases[idx] || '';
    let delay = 0;
    let next = () => {};

    if (phase === 'typing') {
      if (typed.length < phrase.length) {
        delay = 38;
        next = () => setTyped(phrase.slice(0, typed.length + 1));
      } else {
        delay = 1300;
        next = () => setPhase('deleting');
      }
    } else if (typed.length > 0) {
      delay = 22;
      next = () => setTyped(typed.slice(0, -1));
    } else {
      delay = 180;
      next = () => {
        setIdx((current) => (current + 1) % phrases.length);
        setPhase('typing');
      };
    }

    const timer = setTimeout(next, delay);
    return () => clearTimeout(timer);
  }, [idx, phase, phrases, reducedMotion, toolCall, typed]);

  const label = toolCall
    ? copy.chat.tools[toolCall] || copy.chat.tools._fallback
    : reducedMotion
      ? phrases[idx]
      : typed;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
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
          borderColor: 'divider',
          borderRadius: '4px 16px 16px 16px',
          p: 1.5,
          minWidth: 200,
          maxWidth: 300,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            component={motion.div}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'secondary.main',
              borderTopColor: 'transparent',
            }}
          />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'secondary.main', minHeight: '1.15em' }}>
            {label}
            {!toolCall && !reducedMotion && (
              <Box
                component={motion.span}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                sx={{ display: 'inline-block', ml: '1px' }}
              >
                |
              </Box>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'action.hover', width: '90%' }} />
          <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'action.hover', width: '70%' }} />
          <Box sx={{ height: 34, borderRadius: 2, bgcolor: 'action.hover', mt: 0.5 }} />
        </Box>
      </Box>
    </Box>
  );
}

export default TypingIndicator;
