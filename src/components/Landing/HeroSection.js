import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { motion } from 'framer-motion';
import { ArrowRight, Sprout, Camera, FileText, MessageCircle } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

function HeroSection() {
  const isDark = useDarkMode();

  return (
    <Box
      sx={{
        background: isDark
          ? 'linear-gradient(135deg, #0D1B12 0%, #132218 50%, #1A2E22 100%)'
          : 'linear-gradient(135deg, #FAFDF7 0%, #E8F5E9 50%, #D4EDDA 100%)',
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 6, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ flex: '1 1 60%' }}
        >
          <Chip
            icon={<Sprout size={16} />}
            label="Tecnologia acessível para qualquer produtor"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(45, 106, 79, 0.1)',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.85rem',
              py: 2.5,
              px: 1,
              '& .MuiChip-icon': { color: 'primary.main' },
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.2rem' },
              fontWeight: 700,
              color: isDark ? 'text.primary' : 'primary.dark',
              lineHeight: 1.15,
              mb: 2.5,
              letterSpacing: '-0.02em',
            }}
          >
            Diagnóstico fitossanitário inteligente ao alcance de todos
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.15rem' },
              color: 'text.secondary',
              mb: 4,
              maxWidth: 520,
              lineHeight: 1.7,
            }}
          >
            Hoje detectamos doenças e pragas na soja. Amanhã, em qualquer cultivo.
            Envie uma foto e receba diagnóstico com plano de ação — grátis e sem cadastro.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/chat"
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowRight size={20} />}
              sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Começar Agora
            </Button>
            <Button
              component={Link}
              to="/api-docs"
              variant="outlined"
              color="primary"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Ver Documentação da API
            </Button>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          style={{ flex: '1 1 40%' }}
        >
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 4,
              p: 3,
              boxShadow: isDark
                ? '0 20px 60px rgba(0,0,0,0.4)'
                : '0 20px 60px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider',
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#E63946' }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F4A261' }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#52B788' }} />
              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>Ze Praga Chat</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sprout size={16} color="white" />
              </Box>
              <Box sx={{ backgroundColor: 'custom.chatPreview', borderRadius: '12px 12px 12px 4px', p: 1.5, fontSize: '0.85rem', color: 'text.primary' }}>
                Olá! Envie uma foto da folha para análise fitossanitária.
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Box sx={{ backgroundColor: 'chat.user', borderRadius: '12px 12px 4px 12px', p: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem' }}>
                <Camera size={14} />
                folha_soja.jpg
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sprout size={16} color="white" />
              </Box>
              <Box sx={{ backgroundColor: 'custom.chatPreview', borderRadius: '12px 12px 12px 4px', p: 1.5, fontSize: '0.85rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <FileText size={14} color="#2D6A4F" />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Ferrugem Asiática — 94.2%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Doença identificada com plano de ação disponível.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ flex: 1, backgroundColor: 'custom.chatPreview', borderRadius: 3, p: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                Digite sua mensagem...
              </Box>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={14} color="white" />
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

export default HeroSection;
