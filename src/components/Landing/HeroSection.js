import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { Camera, Play } from 'lucide-react';
import { copy } from '../../copy/ze';

const stats = [
  { value: '94', unit: '%', label: 'acerto em ferrugem' },
  { value: '5', unit: 's', label: 'por diagnóstico' },
  { value: '12', unit: '', label: 'pragas reconhecidas' },
];

function scrollToHowItWorks() {
  const el = document.getElementById('como-funciona');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function HeroVisual() {
  return (
    <Box sx={{ position: 'relative', aspectRatio: '4 / 5', maxWidth: 380, ml: { md: 'auto' }, width: '100%' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 6,
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #74C69D 0%, #1F5A3D 70%, #0F3D27 100%)',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 200 250"
          sx={{ width: '100%', height: '100%', opacity: 0.55 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M100 30 Q40 60 30 130 Q40 210 100 230 Q160 210 170 130 Q160 60 100 30 Z" fill="#0F3D27" stroke="#F4C95D" strokeWidth="0.5" opacity="0.6" />
          <path d="M100 32 Q100 130 100 228" stroke="#F4C95D" strokeWidth="0.8" fill="none" />
          <circle cx="72" cy="110" r="10" fill="#8B3A26" opacity="0.85" />
          <circle cx="125" cy="130" r="7" fill="#8B3A26" opacity="0.7" />
          <circle cx="85" cy="165" r="11" fill="#8B3A26" opacity="0.9" />
        </Box>
      </Box>

      {/* timer badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: (t) => t.palette.brand.milho,
          color: (t) => t.palette.brand.solo,
          px: 1.5,
          py: 0.5,
          borderRadius: 999,
          fontFamily: (t) => t.typography.fontFamilyMono,
          fontSize: '0.7rem',
          fontWeight: 700,
          boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
        }}
      >
        ⏱ 4.8s
      </Box>

      {/* floating diagnosis card */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -22,
          left: -16,
          right: 24,
          bgcolor: 'background.paper',
          borderRadius: 4,
          p: 2,
          boxShadow: '0 20px 40px -16px rgba(28,42,32,0.35)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: (t) => t.palette.severity.alta, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            !
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.1 }}>
              Ferrugem Asiática
            </Typography>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.62rem', color: 'text.secondary' }}>
              Phakopsora pachyrhizi
            </Typography>
          </Box>
          <Box sx={{ px: 1, py: 0.25, borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(192,58,43,0.12)', color: (t) => t.palette.severity.alta }}>
            94%
          </Box>
        </Box>
        <Box sx={{ height: 6, bgcolor: 'rgba(28,42,32,0.06)', borderRadius: 999, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: '94%', background: 'linear-gradient(90deg,#C03A2B,#E07856)' }} />
        </Box>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 1 }}>
          "Tá em estágio inicial. Te mando a receita."
        </Typography>
      </Box>
    </Box>
  );
}

function HeroSection() {
  return (
    <Box
      sx={{
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'linear-gradient(160deg, #0F1B14 0%, #18261D 100%)'
            : 'linear-gradient(160deg, #FBF7EE 0%, #C7E8D4 130%)',
        px: { xs: 3, md: 7 },
        py: { xs: 6, md: 10 },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
          gap: { xs: 7, md: 6 },
          alignItems: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyHand, color: 'secondary.main', fontSize: '1.5rem', mb: 0.5 }}>
            {copy.landing.kicker}
          </Typography>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: '2.1rem', sm: '2.6rem', md: '3.4rem' }, mb: 2.5 }}
          >
            Manda a foto da folha.{' '}
            <Box component="span" sx={{ color: 'secondary.main' }}>
              Eu te digo
            </Box>{' '}
            que praga é e o que fazer.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mb: 3.5 }}>
            {copy.landing.heroSubtitle}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button component={Link} to="/chat" variant="contained" color="secondary" size="large" startIcon={<Camera size={20} />} sx={{ px: 3.5, py: 1.5 }}>
              {copy.cta.sendPhoto}
            </Button>
            <Button onClick={scrollToHowItWorks} variant="outlined" color="inherit" size="large" startIcon={<Play size={18} />} sx={{ px: 3.5, py: 1.5, borderColor: 'divider', color: 'text.primary' }}>
              {copy.cta.seeHowItWorks}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            {stats.map((s) => (
              <Box key={s.label}>
                <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.75rem', color: 'primary.main', lineHeight: 1 }}>
                  {s.value}
                  <Box component="span" sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>{s.unit}</Box>
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <HeroVisual />
        </motion.div>
      </Box>
    </Box>
  );
}

export default HeroSection;
