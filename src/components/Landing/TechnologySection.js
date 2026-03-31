import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme } from '@mui/material/styles';
import { useDarkMode } from '../../hooks/useDarkMode';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Cpu, BarChart3, Zap } from 'lucide-react';

const techBadges = ['PyTorch', 'FastAPI', 'AWS', 'GPT-4o', 'React'];

const metrics = [
  { label: 'Acurácia Média', value: 94, color: '#2D6A4F' },
  { label: 'F1-Score', value: 92, color: '#52B788' },
  { label: 'Precisão', value: 95, color: '#1B4332' },
];

const models = [
  { name: 'ResNet-50', icon: Brain, desc: 'Rede residual profunda para classificação robusta' },
  { name: 'EfficientNet-B4', icon: Zap, desc: 'Eficiência otimizada entre acurácia e velocidade' },
  { name: 'ViT-B/16', icon: Cpu, desc: 'Vision Transformer para captura de padrões globais' },
];

function TechnologySection() {
  const theme = useTheme();
  const isDark = useDarkMode();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        px: { xs: 3, md: 6 },
        backgroundColor: 'background.paper',
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
          Tecnologia
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Modelos de deep learning de última geração treinados com o dataset PlantVillage
          para classificação precisa de doenças foliares
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {models.map((model) => {
            const Icon = model.icon;
            return (
              <Grid size={{ xs: 12, md: 4 }} key={model.name}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.light',
                        boxShadow: '0 4px 20px rgba(45, 106, 79, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Icon size={22} color="#2D6A4F" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {model.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {model.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              backgroundColor: 'background.default',
              borderRadius: 4,
              p: { xs: 3, md: 5 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <BarChart3 size={22} color="#2D6A4F" />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Métricas de Desempenho
              </Typography>
            </Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {metrics.map((metric) => (
                <Grid size={{ xs: 12, sm: 4 }} key={metric.label}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: metric.color }}>
                        {metric.value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={metric.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.divider,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: metric.color,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {techBadges.map((badge) => (
                <Chip
                  key={badge}
                  label={badge}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(45, 106, 79, 0.08)',
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                />
              ))}
            </Box>
          </Box>
        </motion.div>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={Link}
            to="/chat"
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowRight size={20} />}
            sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
          >
            Experimente Agora
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default TechnologySection;
