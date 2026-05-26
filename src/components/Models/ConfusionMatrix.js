import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Matriz de confusão data-driven (auditoria, seção 14). Aceita `labels` (N) e
 * `matrix` (NxN, linha = real, coluna = predito). Diagonal em Verde Mata sólido;
 * off-diagonal com opacidade proporcional ao valor.
 */
function ConfusionMatrix({ labels, matrix, shortLabels }) {
  const n = labels.length;
  const cols = shortLabels || labels;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `minmax(78px, 110px) repeat(${n}, minmax(34px, 1fr))`,
          gap: 0.5,
          minWidth: 360,
          fontFamily: (t) => t.typography.fontFamilyMono,
        }}
      >
        <Box />
        {cols.map((c) => (
          <Typography key={c} sx={{ fontSize: '0.62rem', color: 'text.secondary', textAlign: 'center', pb: 0.5 }}>
            {c}
          </Typography>
        ))}

        {matrix.map((row, ri) => (
          <React.Fragment key={labels[ri]}>
            <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary', display: 'flex', alignItems: 'center', pr: 1 }}>
              {labels[ri]}
            </Typography>
            {row.map((val, ci) => {
              const isDiag = ri === ci;
              return (
                <Box
                  key={ci}
                  sx={{
                    aspectRatio: '1',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 1,
                    fontSize: '0.66rem',
                    fontWeight: isDiag ? 700 : 500,
                    color: isDiag ? '#fff' : 'text.secondary',
                    backgroundColor: (t) =>
                      isDiag ? t.palette.primary.main : `rgba(31,90,61,${Math.min(val / 25, 0.28)})`,
                  }}
                >
                  {val}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default ConfusionMatrix;
