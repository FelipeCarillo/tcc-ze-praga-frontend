import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, Sprout, HelpCircle, Leaf } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Camera,
    title: 'Analisar folha',
    description: 'Envie uma foto para diagnóstico instantâneo',
    action: 'upload',
    colorKey: 'primary',
  },
  {
    icon: MessageCircle,
    title: 'Descrever sintomas',
    description: 'Minha soja tem manchas amarelas. O que pode ser?',
    text: 'Minha soja tem manchas amarelas nas folhas. O que pode ser?',
    colorKey: 'info',
  },
  {
    icon: Sprout,
    title: 'Controle de ferrugem',
    description: 'Quais fungicidas usar para ferrugem asiática?',
    text: 'Quais fungicidas usar para ferrugem asiática?',
    colorKey: 'success',
  },
  {
    icon: HelpCircle,
    title: 'Como funciona?',
    description: 'Saiba mais sobre os modelos de IA utilizados',
    text: 'Como funciona o diagnóstico por IA?',
    colorKey: 'warning',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function QuickSuggestions({ onSend, onUploadClick }) {
  const theme = useTheme();

  const handleClick = (s) => {
    if (s.action === 'upload' && onUploadClick) {
      onUploadClick();
    } else if (s.text) {
      onSend(s.text);
    }
  };

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        px: { xs: 2, sm: 4 },
        py: 6,
        gap: 4,
      }}
    >
      {/* Hero */}
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ textAlign: 'center' }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.light} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.28)}, 0 4px 12px ${alpha(theme.palette.primary.dark, 0.2)}`,
          }}
        >
          <Leaf size={32} color="white" strokeWidth={1.8} />
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.025em',
            mb: 1,
          }}
        >
          Olá! Sou o{' '}
          <Box
            component="span"
            sx={{ color: 'primary.main' }}
          >
            Zé Praga
          </Box>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 340, mx: 'auto', lineHeight: 1.7 }}
        >
          Especialista em diagnóstico de doenças foliares da soja.
          Envie uma foto ou descreva o que está vendo na lavoura.
        </Typography>
      </Box>

      {/* Suggestion cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
          width: '100%',
          maxWidth: 520,
        }}
      >
        {SUGGESTIONS.map((s) => {
          const Icon = s.icon;
          const paletteColor =
            theme.palette[s.colorKey]?.main || theme.palette.primary.main;

          return (
            <Box
              key={s.title}
              component={motion.div}
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(s)}
              sx={{
                p: 2,
                borderRadius: '14px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                cursor: 'pointer',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                '&:hover': {
                  borderColor: alpha(paletteColor, 0.5),
                  backgroundColor: alpha(paletteColor, 0.04),
                  boxShadow: `0 6px 24px ${alpha(paletteColor, 0.1)}`,
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: alpha(paletteColor, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={paletteColor} strokeWidth={2} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.3 }}
                >
                  {s.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1.45, display: 'block' }}
                >
                  {s.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default QuickSuggestions;
