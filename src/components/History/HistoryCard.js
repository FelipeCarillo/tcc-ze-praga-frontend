import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const severityConfig = {
  alta: { label: 'Alta', color: 'error' },
  media: { label: 'Media', color: 'warning' },
  baixa: { label: 'Baixa', color: 'info' },
  nenhuma: { label: 'Saudavel', color: 'success' },
};

function HistoryCard({ diagnosis, onDelete }) {
  const navigate = useNavigate();
  const severity = severityConfig[diagnosis.severity] || severityConfig.media;

  const date = new Date(diagnosis.timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
      {diagnosis.imageUrl && (
        <Box
          component="img"
          src={diagnosis.imageUrl}
          alt={diagnosis.disease}
          sx={{
            width: { xs: '100%', sm: 150 },
            height: { xs: 150, sm: 'auto' },
            objectFit: 'cover',
          }}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {diagnosis.disease}
            </Typography>
            <Chip label={severity.label} color={severity.color} size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            {diagnosis.scientificName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Confianca: {Math.round(diagnosis.confidence * 100)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate('/historico/' + diagnosis.id)}
          >
            Ver Detalhes
          </Button>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(diagnosis.id)}
            sx={{ ml: 'auto' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </Box>
    </Card>
  );
}

export default HistoryCard;
