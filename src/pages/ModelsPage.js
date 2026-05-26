import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ConfusionMatrix from '../components/Models/ConfusionMatrix';
import Pipeline from '../components/Models/Pipeline';

const models = [
  { id: 'ensemble', name: 'Ensemble', sub: 'ResNet + EfficientNet + ViT', accuracy: 0.978, f1: 0.976, latency: 185, size: 502, prod: true },
  { id: 'efficientnet', name: 'EfficientNet-B4', sub: 'tf-keras · imagenet', accuracy: 0.971, f1: 0.968, latency: 62, size: 74 },
  { id: 'vit', name: 'ViT-B/16', sub: 'vision transformer', accuracy: 0.964, f1: 0.961, latency: 78, size: 330 },
  { id: 'resnet50', name: 'ResNet-50', sub: 'torchvision · imagenet', accuracy: 0.956, f1: 0.952, latency: 45, size: 98 },
];

const prod = models.find((m) => m.prod);

const stats = [
  { value: '97,8', unit: '%', label: 'Top-1 accuracy' },
  { value: '0,98', unit: '', label: 'F1 macro' },
  { value: '185', unit: 'ms', label: 'Latência P95' },
  { value: '502', unit: 'MB', label: 'Checkpoint' },
];

const matrixLabels = ['Ferrugem', 'Mancha-alvo', 'Antracnose', 'Cercospor.', 'Míldio', 'Saudável'];
const matrixShort = ['Ferr.', 'Manch.', 'Antr.', 'Cerc.', 'Míld.', 'Saud.'];
const confusion = [
  [97, 1, 1, 0, 1, 0],
  [1, 95, 2, 1, 1, 0],
  [1, 2, 94, 2, 1, 0],
  [0, 1, 2, 96, 1, 0],
  [1, 1, 1, 1, 96, 0],
  [0, 0, 0, 0, 1, 99],
];

const limitations = [
  { tone: 'tijolo', title: 'Confusão #1', body: 'Cercosporiose × Antracnose em estágio inicial — sinais visuais parecidos. Resíduo de ~2-3%.' },
  { tone: 'solo', title: 'Limitação #1', body: 'Hoje só soja (6 classes). Milho, café e algodão estão no roadmap 2026.' },
  { tone: 'solo', title: 'Limitação #2', body: 'Foto muito desfocada ou com pouca luz: o Zé responde "não sei", não tenta adivinhar.' },
];

const dataset = [
  { label: 'Dataset', value: 'PlantVillage (soja)' },
  { label: 'Imagens', value: '~5.500' },
  { label: 'Classes', value: '6' },
  { label: 'Split', value: '70/15/15' },
  { label: 'Resolução', value: '224×224' },
  { label: 'Framework', value: 'PyTorch 2.x' },
];

function StatHero() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', my: 4 }}>
      {stats.map((s, i) => (
        <Box key={s.label} sx={{ p: 3, borderRight: { md: i < 3 ? '1px solid' : 'none' }, borderRightColor: 'divider', borderBottom: { xs: i < 2 ? '1px solid' : 'none', md: 'none' }, borderBottomColor: 'divider' }}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: { xs: '2.2rem', md: '3rem' }, color: 'primary.main', lineHeight: 1 }}>
            {s.value}
            <Box component="span" sx={{ fontSize: '1.2rem', color: 'text.secondary' }}>{s.unit}</Box>
          </Typography>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', color: 'text.secondary', mt: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {s.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ArchitectureTable() {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.8fr 1fr 1fr', px: 2, py: 1.25, backgroundColor: (t) => t.palette.surface.sunken, fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
        <Box>Modelo</Box><Box>Acurácia</Box><Box>F1</Box><Box>Latência</Box><Box>Tamanho</Box>
      </Box>
      {models.map((m) => (
        <Box key={m.id} sx={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.8fr 1fr 1fr', px: 2, py: 1.5, alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</Typography>
              {m.prod && (
                <Box sx={{ px: 0.75, py: 0.1, borderRadius: 999, fontSize: '0.6rem', fontWeight: 700, bgcolor: (t) => t.palette.brand.cerradoSoft, color: (t) => t.palette.brand.tijolo }}>PROD ★</Box>
              )}
            </Box>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.62rem', color: 'text.secondary' }}>{m.sub}</Typography>
          </Box>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700 }}>{(m.accuracy * 100).toFixed(1)}%</Typography>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700 }}>{m.f1.toFixed(2)}</Typography>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700 }}>{m.latency}ms</Typography>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700 }}>{m.size}MB</Typography>
        </Box>
      ))}
    </Box>
  );
}

function ModelsPage() {
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'secondary.main', fontWeight: 700, mb: 1 }}>
        Capítulo 04 · Metodologia
      </Typography>
      <Typography variant="h2" sx={{ mb: 1.5 }}>Como o Zé enxerga uma folha.</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680 }}>
        Quatro arquiteturas foram treinadas sobre o dataset PlantVillage de soja (6 classes), com
        transfer learning, e comparadas no mesmo test-set. O escolhido em produção balanceia
        acurácia, latência e robustez.
      </Typography>

      <StatHero />

      {/* Dataset chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 5 }}>
        {dataset.map((d) => (
          <Box key={d.label} sx={{ px: 1.25, py: 0.75, borderRadius: 2, backgroundColor: (t) => t.palette.surface.sunken }}>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase' }}>{d.label}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{d.value}</Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="h3" sx={{ mb: 2 }}>Comparação de arquiteturas</Typography>
      <ArchitectureTable />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 6 }}>
        ★ <b>{prod.name}</b> escolhido por melhor relação acurácia × robustez. (Valores
        representativos do treinamento; atualizados na versão final.)
      </Typography>

      <Typography variant="h3" sx={{ mb: 1 }}>Matriz de confusão</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Holdout 20%. Diagonal forte = sinal verde; confusão fora da diagonal merece mais dataset.
      </Typography>
      <ConfusionMatrix labels={matrixLabels} shortLabels={matrixShort} matrix={confusion} />

      <Typography variant="h3" sx={{ mt: 6, mb: 2 }}>Pipeline</Typography>
      <Pipeline />

      <Typography variant="h3" sx={{ mt: 6, mb: 2 }}>O que o Zé ainda não sabe</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {limitations.map((l) => (
          <Box key={l.title} sx={{ p: 2, borderRadius: 3, backgroundColor: (t) => (l.tone === 'tijolo' ? t.palette.brand.tijolo : t.palette.brand.solo), color: (t) => t.palette.brand.milhoSoft }}>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.9rem', mb: 0.75 }}>{l.title}</Typography>
            <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.5, opacity: 0.9 }}>{l.body}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default ModelsPage;
