import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDarkMode } from '../../hooks/useDarkMode';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { diseases } from '../../services/mock/mockData';

const severityConfig = {
  alta: { label: 'Severa', color: '#E63946', icon: AlertTriangle, bg: '#FEE2E2' },
  media: { label: 'Moderada', color: '#F4A261', icon: AlertCircle, bg: '#FEF3C7' },
  baixa: { label: 'Leve', color: '#52B788', icon: Info, bg: '#D1FAE5' },
  nenhuma: { label: 'Saudável', color: '#52B788', icon: CheckCircle, bg: '#D1FAE5' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function DiseasesSection() {
  const isDark = useDarkMode();
  const displayDiseases = diseases.filter((d) => d.severity !== 'nenhuma');

  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        px: { xs: 3, md: 6 },
        backgroundColor: 'background.default',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            color: isDark ? 'text.primary' : 'primary.dark',
            mb: 1.5,
          }}
        >
          Doenças Detectadas
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 6,
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Atualmente focados na soja, com infraestrutura pronta para expandir a diversos cultivos
        </Typography>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ staggerChildren: 0.1 }}
        >
          <Grid container spacing={3}>
            {displayDiseases.map((disease) => {
              const severity = severityConfig[disease.severity];
              const SevIcon = severity.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={disease.id}>
                  <motion.div variants={cardVariants}>
                    <Card
                      sx={{
                        p: 3,
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.28)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.08)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Chip
                        icon={<SevIcon size={14} />}
                        label={severity.label}
                        size="small"
                        sx={{
                          mb: 2,
                          backgroundColor: severity.bg,
                          color: severity.color,
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: severity.color },
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {disease.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontStyle: 'italic', display: 'block', mb: 1.5 }}
                      >
                        {disease.scientificName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {disease.description}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>
      </Box>
    </Box>
  );
}

export default DiseasesSection;

