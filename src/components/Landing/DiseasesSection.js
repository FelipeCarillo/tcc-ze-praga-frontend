import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { motion } from 'framer-motion';
import { diseases } from '../../services/mock/mockData';

const SEV = {
  alta: { label: 'Severa', token: 'alta' },
  media: { label: 'Moderada', token: 'media' },
  baixa: { label: 'Leve', token: 'baixa' },
  nenhuma: { label: 'Saudável', token: 'nenhuma' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function LeafMark({ healthy }) {
  return (
    <Box component="svg" viewBox="0 0 100 100" sx={{ width: 52, height: 52, mb: 1.5 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={healthy ? 'lfh' : 'lfp'} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={healthy ? '#74C69D' : '#A8C99B'} />
          <stop offset="100%" stopColor={healthy ? '#1F5A3D' : '#4A6B3D'} />
        </linearGradient>
      </defs>
      <path d="M50 12 Q22 28 18 56 Q22 84 50 90 Q78 84 82 56 Q78 28 50 12 Z" fill={`url(#${healthy ? 'lfh' : 'lfp'})`} stroke="#1F5A3D" strokeWidth="1.2" />
      <path d="M50 14 Q50 50 50 88" stroke="#1F5A3D" strokeWidth="1" fill="none" opacity="0.7" />
      {!healthy && (
        <>
          <circle cx="36" cy="42" r="6" fill="#8B3A26" opacity="0.75" />
          <circle cx="62" cy="52" r="5" fill="#8B3A26" opacity="0.7" />
          <circle cx="42" cy="66" r="7" fill="#8B3A26" opacity="0.8" />
        </>
      )}
    </Box>
  );
}

function DiseasesSection() {
  const list = diseases.filter((d) => d.severity !== 'nenhuma');

  return (
    <Box sx={{ py: { xs: 7, md: 9 }, px: { xs: 3, md: 7 }, backgroundColor: 'background.default' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 1 }}>
          Pragas que eu reconheço
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 5, maxWidth: 560, mx: 'auto' }}>
          Hoje cuido de soja. Em breve, milho e café.
        </Typography>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} transition={{ staggerChildren: 0.08 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            {list.map((disease) => {
              const sev = SEV[disease.severity] || SEV.media;
              return (
                <motion.div key={disease.id} variants={cardVariants}>
                  <Card sx={{ p: 2.5, height: '100%', backgroundColor: (t) => t.palette.surface.sunken, transition: 'transform 0.25s', '&:hover': { transform: 'translateY(-3px)' } }}>
                    <LeafMark healthy={disease.severity === 'nenhuma'} />
                    <Box sx={{ display: 'inline-flex', px: 1, py: 0.25, borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, mb: 1, bgcolor: (t) => `${t.palette.severity[sev.token]}22`, color: (t) => t.palette.severity[sev.token] }}>
                      {sev.label}
                    </Box>
                    <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1rem', lineHeight: 1.15 }}>
                      {disease.name}
                    </Typography>
                    <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', color: 'text.secondary', mt: 0.25 }}>
                      {disease.scientificName}
                    </Typography>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

export default DiseasesSection;
