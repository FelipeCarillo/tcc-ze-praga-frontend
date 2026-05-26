import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';
import { copy } from '../../copy/ze';

/**
 * Skeleton do estado "Zé pensando" (auditoria, seção 11): bolha do Zé com um
 * spinner pequeno + microcopy rotativa (a cada ~1.2s) + placeholders de linha.
 * Quebra a frieza de "Analisando…" e mantém a voz.
 */
function TypingIndicator() {
  const [idx, setIdx] = useState(0);
  const phrases = copy.chat.thinking;

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % phrases.length);
    }, 1200);
    return () => clearInterval(id);
  }, [phrases.length]);

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
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'secondary.main' }}>
            {phrases[idx]}
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
