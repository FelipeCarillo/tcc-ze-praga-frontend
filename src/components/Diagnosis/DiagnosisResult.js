import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ConfidenceBar from './ConfidenceBar';
import ActionPlan from './ActionPlan';

const severityConfig = {
  alta: { label: 'Severidade Alta', color: 'error' },
  media: { label: 'Severidade Media', color: 'warning' },
  baixa: { label: 'Severidade Baixa', color: 'info' },
  nenhuma: { label: 'Saudavel', color: 'success' },
};

function DiagnosisResult({ result, showImage = false }) {
  if (!result) return null;

  const severity = severityConfig[result.severity] || severityConfig.media;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        {showImage && result.imageUrl && (
          <Box
            sx={{
              mb: 2,
              textAlign: 'center',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={result.imageUrl}
              alt="Imagem analisada"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5">{result.disease}</Typography>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {result.scientificName}
            </Typography>
          </Box>
          <Chip label={severity.label} color={severity.color} size="medium" />
        </Box>

        <ConfidenceBar confidence={result.confidence} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" sx={{ mb: 2 }}>
          {result.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <ActionPlan actions={result.actionPlan} />
      </CardContent>
    </Card>
  );
}

export default DiagnosisResult;
