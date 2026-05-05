import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: (i) => ({
    y: [-4, 0, -4],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.1,
      repeat: Infinity,
      delay: i * 0.18,
      ease: 'easeInOut',
    },
  }),
};

function TypingIndicator() {
  const theme = useTheme();
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, mb: 2 }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '10px',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Leaf size={15} color="white" />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1.5,
          backgroundColor: 'background.paper',
          borderRadius: '4px 16px 16px 16px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: `0 1px 8px ${alpha(theme.palette.common.black, 0.06)}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            component={motion.div}
            custom={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
            }}
          />
        ))}
        <Typography
          variant="caption"
          sx={{ ml: 1, color: 'text.secondary', fontWeight: 500, fontSize: '0.72rem' }}
        >
          Analisando...
        </Typography>
      </Box>
    </Box>
  );
}

export default TypingIndicator;
