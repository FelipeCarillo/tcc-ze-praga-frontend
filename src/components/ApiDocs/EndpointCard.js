import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CodeBlock from './CodeBlock';
import { useTheme } from '@mui/material/styles';

const methodColors = {
  GET: { bg: '#D1FAE5', color: '#065F46' },
  POST: { bg: '#DBEAFE', color: '#1E40AF' },
  PUT: { bg: '#FEF3C7', color: '#92400E' },
  DELETE: { bg: '#FEE2E2', color: '#991B1B' },
};

function EndpointCard({ method, path, description, parameters, responseExample, codeExamples }) {
  const theme = useTheme();
  const mColor = methodColors[method] || methodColors.GET;

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        mb: 3,
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Chip
            label={method}
            size="small"
            sx={{
              backgroundColor: mColor.bg,
              color: mColor.color,
              fontWeight: 700,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          />
          <Typography
            variant="body1"
            sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary' }}
          >
            {path}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          {description}
        </Typography>

        {parameters && parameters.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Parâmetros
            </Typography>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                '& th, & td': {
                  textAlign: 'left',
                  py: 1,
                  px: 1.5,
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                },
                '& th': {
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                },
              }}
            >
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param) => (
                  <tr key={param.name}>
                    <td>
                      <code style={{ color: theme.palette.primary.main, fontWeight: 600 }}>{param.name}</code>
                      {param.required && (
                        <Typography component="span" variant="caption" sx={{ color: '#E63946', ml: 0.5 }}>
                          *
                        </Typography>
                      )}
                    </td>
                    <td><code>{param.type}</code></td>
                    <td>{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}

        {responseExample && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Exemplo de Resposta
            </Typography>
            <Box
              component="pre"
              sx={{
                backgroundColor: 'surface.sunken',
                color: 'text.primary',
                borderRadius: 2,
                p: 2,
                overflowX: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <code>{JSON.stringify(responseExample, null, 2)}</code>
            </Box>
          </Box>
        )}

        {codeExamples && <CodeBlock examples={codeExamples} />}
      </Box>
    </Box>
  );
}

export default EndpointCard;
