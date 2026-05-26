import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { copy } from '../../copy/ze';

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const kickerSx = {
  fontWeight: 700,
  fontSize: '0.8rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'primary.main',
};

function HowItWorksSection() {
  return (
    <Box
      id="como-funciona"
      sx={{ py: { xs: 7, md: 9 }, px: { xs: 3, md: 7 }, backgroundColor: (t) => t.palette.surface.sunken }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto', textAlign: 'center' }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>Como o Zé trabalha</Typography>
        <Typography variant="h2" sx={{ mb: 5 }}>
          3 passos. Nada de cadastro.
        </Typography>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {copy.landing.steps.map((step, i) => (
              <motion.div key={step.title} variants={itemVariants}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontSize: '2.6rem', fontWeight: 700, color: 'secondary.main', lineHeight: 1 }}>
                    {i + 1}
                  </Typography>
                  <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 600, fontSize: '1.2rem', mt: 1.5, mb: 0.5 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto' }}>
                    {step.desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

export default HowItWorksSection;
