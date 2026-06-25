import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { prodModel, DATASET } from '../../data/modelMetrics';

const metrics = [
  { value: (prodModel.accuracy * 100).toFixed(1).replace('.', ','), unit: '%', label: 'Top-1 accuracy' },
  { value: prodModel.f1.toFixed(2).replace('.', ','), unit: '', label: 'F1 macro' },
  { value: DATASET.totalImages.toLocaleString('pt-BR'), unit: '', label: 'imagens (ASDID)' },
  { value: String(DATASET.classes), unit: '', label: 'classes de soja' },
];

/** "Pra banca" — bloco escuro com métricas e links institucionais (auditoria, seção 10). */
function TechnologySection() {
  return (
    <Box sx={{ py: { xs: 7, md: 9 }, px: { xs: 3, md: 7 }, backgroundColor: (t) => t.palette.brand.noite, color: (t) => t.palette.brand.creme }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: (t) => t.palette.brand.milho, mb: 1 }}>
          Pra banca
        </Typography>
        <Typography variant="h2" sx={{ color: (t) => t.palette.brand.creme, mb: 1.5 }}>
          Metodologia, métricas e honestidade.
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(240,237,226,0.75)', maxWidth: 640, mb: 4 }}>
          Ensemble de 3 redes (ResNet-50 + EfficientNet-B4 + ViT-B/16) em produção, treinado sobre
          6 classes de soja no dataset ASDID. Avaliado no test-set (n={DATASET.split.test}).
          Metodologia completa, matriz de confusão e limitações conhecidas nas páginas técnicas.
        </Typography>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: (t) => t.palette.brand.noite3, mb: 4 }}>
            {metrics.map((m, i) => (
              <Box key={m.label} sx={{ p: 2.5, borderRight: { md: i < 3 ? '1px solid' : 'none' }, borderRightColor: (t) => t.palette.brand.noite3, borderBottom: { xs: i < 2 ? '1px solid' : 'none', md: 'none' }, borderBottomColor: (t) => t.palette.brand.noite3 }}>
                <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '2.2rem', color: (t) => t.palette.brand.milho, lineHeight: 1 }}>
                  {m.value}
                  <Box component="span" sx={{ fontSize: '1.1rem' }}>{m.unit}</Box>
                </Typography>
                <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.68rem', color: 'rgba(240,237,226,0.6)', mt: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {m.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button component={Link} to="/modelos" variant="contained" endIcon={<ArrowRight size={18} />} sx={{ bgcolor: (t) => t.palette.brand.milho, color: (t) => t.palette.brand.mata, fontWeight: 800, '&:hover': { bgcolor: '#E9BC45' } }}>
            Ver modelos & métricas
          </Button>
          <Button component={Link} to="/api-docs" variant="outlined" startIcon={<BookOpen size={18} />} sx={{ color: (t) => t.palette.brand.creme, borderColor: 'rgba(240,237,226,0.3)', '&:hover': { borderColor: (t) => t.palette.brand.milho } }}>
            Documentação da API
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default TechnologySection;
