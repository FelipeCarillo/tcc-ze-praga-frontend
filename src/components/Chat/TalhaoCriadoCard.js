import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import NovoTalhaoSheet from '../Fazenda/NovoTalhaoSheet';
import { listFazendas } from '../../services/fazendasService';
import { deleteTalhao } from '../../services/talhoesService';
import { getActiveTalhao, setActiveTalhao } from '../../services/activeTalhao';

function data(iso) {
  if (!iso) return '—';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/**
 * "Talhão criado" — m-Chat-Talhao do canvas (TCC-098): o Zé cadastrou o
 * talhão descrito na conversa. Editar abre o cadastro; Desfazer apaga.
 */
export default function TalhaoCriadoCard({ talhao }) {
  const [current, setCurrent] = useState(talhao);
  const [state, setState] = useState('ok'); // ok | desfeito | erro
  const [sheet, setSheet] = useState(null);

  const editar = async () => {
    try {
      setSheet(await listFazendas());
    } catch {
      setSheet([]);
    }
  };
  const desfazer = async () => {
    try {
      await deleteTalhao(current.id);
      if (getActiveTalhao()?.id === current.id) setActiveTalhao(null);
      setState('desfeito');
    } catch {
      setState('erro');
    }
  };

  if (state === 'desfeito')
    return (
      <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
        Cadastro do {current.nome} desfeito.
      </Typography>
    );

  return (
    <Box
      sx={{
        width: { xs: '88%', md: 420 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '20px 20px 20px 6px',
        overflow: 'hidden',
        '@keyframes zpPop': { '0%': { transform: 'scale(.6)', opacity: 0 }, '70%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      }}
    >
      <Box sx={{ px: 1.75, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#C8F169', display: 'grid', placeItems: 'center', flexShrink: 0, animation: 'zpPop .5s .2s cubic-bezier(.2,.7,.2,1) both' }}>
          <Check size={20} color="#0F1A13" strokeWidth={2.6} aria-hidden="true" />
        </Box>
        <Box minWidth={0}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.75rem', fontWeight: 700, color: 'primary.main', letterSpacing: '.04em' }}>
            TALHÃO CRIADO
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem' }} noWrap>
            {current.nome}
            {current.apelido ? ` · ${current.apelido}` : ''}
          </Typography>
          {current.fazendaNome && (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>na {current.fazendaNome}</Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ px: 1.75, py: 1.25, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.75, fontSize: '0.8125rem' }}>
        {[
          ['Área', current.hectares ? `${current.hectares} ha` : '—', true],
          ['Cultura', 'Soja', false],
          ['Semeadura', data(current.dataSemeadura), true],
        ].map(([k, v, mono]) => (
          <Box key={k}>
            <Box sx={{ color: 'text.secondary' }}>{k}</Box>
            <Box sx={{ fontWeight: 700, fontFamily: mono ? (t) => t.typography.fontFamilyMono : undefined }}>{v}</Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ px: 1, pb: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Box component="button" type="button" onClick={editar} sx={{ height: 40, px: 1.5, border: 0, borderRadius: '10px', bgcolor: 'transparent', color: 'primary.main', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
          Editar
        </Box>
        <Box component="button" type="button" onClick={desfazer} sx={{ height: 40, px: 1.5, border: 0, borderRadius: '10px', bgcolor: 'transparent', color: 'text.secondary', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
          Desfazer
        </Box>
        {state === 'erro' && <Typography sx={{ fontSize: '0.8125rem', color: 'error.main' }}>Não consegui desfazer agora.</Typography>}
      </Box>
      <NovoTalhaoSheet
        open={Boolean(sheet)}
        fazendas={sheet || []}
        talhao={current}
        onClose={() => setSheet(null)}
        onSaved={(saved) => {
          setSheet(null);
          if (saved) setCurrent((c) => ({ ...c, ...saved }));
        }}
      />
    </Box>
  );
}
