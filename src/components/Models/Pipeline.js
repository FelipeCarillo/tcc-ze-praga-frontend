import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Camera, Settings2, BrainCircuit, BarChart3, MessageCircle, ArrowDown } from 'lucide-react';

const STEPS = [
  { icon: Camera, title: 'Upload', desc: 'Foto JPEG/PNG até 10 MB', tone: 'mata' },
  { icon: Settings2, title: 'Preprocessing', desc: 'Resize 224×224, normalize ImageNet', tone: 'folha' },
  { icon: BrainCircuit, title: 'EfficientNet / Ensemble', desc: 'Inferência · ~185ms', tone: 'prod' },
  { icon: BarChart3, title: 'Softmax + threshold', desc: '≥0.5 = diagnóstico; <0.5 = "não sei"', tone: 'cerrado' },
  { icon: MessageCircle, title: 'Resposta do Zé', desc: 'Copy + receita por classe', tone: 'milho' },
];

function toneSx(tone) {
  switch (tone) {
    case 'prod':
      return { bg: 'primary.main', fg: (t) => t.palette.brand.milho, box: (t) => t.palette.brand.milho, boxFg: 'primary.main' };
    case 'folha':
      return { bg: 'background.paper', fg: 'text.primary', box: (t) => t.palette.brand.folhaSoft, boxFg: 'primary.main' };
    case 'cerrado':
      return { bg: 'background.paper', fg: 'text.primary', box: (t) => t.palette.brand.cerradoSoft, boxFg: (t) => t.palette.brand.tijolo };
    case 'milho':
      return { bg: 'background.paper', fg: 'text.primary', box: (t) => t.palette.brand.milhoSoft, boxFg: '#8A6C0E' };
    default:
      return { bg: 'background.paper', fg: 'text.primary', box: 'primary.main', boxFg: (t) => t.palette.brand.milho };
  }
}

/** Pipeline ilustrado: foto → preprocessing → modelo → softmax → resposta. */
function Pipeline() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 520 }}>
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const tone = toneSx(s.tone);
        return (
          <React.Fragment key={s.title}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: 1.25,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: tone.bg,
                color: tone.fg,
              }}
            >
              <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: tone.box, color: tone.boxFg, flexShrink: 0 }}>
                <Icon size={16} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.title}</Typography>
                <Typography sx={{ fontSize: '0.72rem', opacity: 0.75 }}>{s.desc}</Typography>
              </Box>
            </Box>
            {i < STEPS.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.disabled' }}>
                <ArrowDown size={16} />
              </Box>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

export default Pipeline;
