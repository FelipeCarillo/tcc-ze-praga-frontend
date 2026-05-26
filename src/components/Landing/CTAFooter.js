import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Camera } from 'lucide-react';
import { copy } from '../../copy/ze';

/** Faixa Verde Mata full-bleed que repete a promessa do hero, logo acima do Footer. */
function CTAFooter() {
  return (
    <Box sx={{ backgroundColor: 'primary.main', color: (t) => t.palette.brand.creme, py: { xs: 7, md: 9 }, px: 3, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyHand, color: (t) => t.palette.brand.milho, fontSize: '1.5rem', mb: 1 }}>
          {copy.landing.kicker}
        </Typography>
        <Typography variant="h2" sx={{ color: (t) => t.palette.brand.creme, mb: 3 }}>
          Manda a foto da folha. Eu cuido do resto.
        </Typography>
        <Button
          component={Link}
          to="/chat"
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<Camera size={20} />}
          sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
        >
          {copy.cta.sendPhoto}
        </Button>
      </Box>
    </Box>
  );
}

export default CTAFooter;
