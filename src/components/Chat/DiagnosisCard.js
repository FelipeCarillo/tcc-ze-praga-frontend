import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { alpha, useTheme } from '@mui/material/styles';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import ActionPlan from '../Diagnosis/ActionPlan';

const severityConfig = {
  alta: { label: 'Severa', paletteKey: 'error', icon: AlertTriangle },
  media: { label: 'Moderada', paletteKey: 'warning', icon: AlertCircle },
  baixa: { label: 'Leve', paletteKey: 'success', icon: Info },
  nenhuma: { label: 'Saudável', paletteKey: 'success', icon: CheckCircle },
};

const modelNames = {
  resnet50: 'ResNet-50',
  efficientnet: 'EfficientNet-B4',
  vit: 'ViT-B/16',
  ensemble: 'Ensemble',
};

function getConfidencePaletteKey(confidence) {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.7) return 'warning';
  return 'error';
}

function DiagnosisCard({ diagnosis, onSave }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const severity = severityConfig[diagnosis.severity] || severityConfig.nenhuma;
  const SevIcon = severity.icon;
  const confidencePercent = (diagnosis.confidence * 100).toFixed(1);

  const confidencePaletteKey = getConfidencePaletteKey(diagnosis.confidence);
  const confidenceColor = theme.palette[confidencePaletteKey].main;
  const severityColor = theme.palette[severity.paletteKey].main;
  const severityBg = alpha(severityColor, 0.18);

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        mt: 1,
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {diagnosis.name || diagnosis.disease}
          </Typography>
          <Chip
            icon={<SevIcon size={14} />}
            label={severity.label}
            size="small"
            sx={{
              backgroundColor: severityBg,
              color: severityColor,
              fontWeight: 600,
              '& .MuiChip-icon': { color: severityColor },
            }}
          />
        </Box>

        {diagnosis.scientificName && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 2 }}>
            {diagnosis.scientificName}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
              Confiança
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: confidenceColor, fontSize: '0.8rem' }}>
              {confidencePercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={diagnosis.confidence * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'action.disabledBackground',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: confidenceColor,
                transition: 'width 0.6s ease-in-out',
              },
            }}
          />
        </Box>

        {diagnosis.modelUsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, color: 'text.secondary' }}>
            <Cpu size={12} />
            <Typography variant="caption" color="text.secondary">
              Modelo: <strong>{modelNames[diagnosis.modelUsed] || diagnosis.modelUsed}</strong>
            </Typography>
          </Box>
        )}

        {diagnosis.top3 && diagnosis.top3.length > 1 && (
          <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'surface.sunken', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
              Top-3 Classificações
            </Typography>
            {diagnosis.top3.map((pred, idx) => {
              const predSev = severityConfig[pred.severity] || severityConfig.nenhuma;
              const predColor = theme.palette[predSev.paletteKey].main;

              return (
                <Box key={pred.diseaseId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: idx < 2 ? 0.8 : 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', width: 16 }}>
                    {idx + 1}.
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: idx === 0 ? 700 : 500, display: 'block' }} noWrap>
                      {pred.disease}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 60 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pred.confidence * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'action.disabledBackground',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          backgroundColor: idx === 0 ? predColor : 'text.secondary',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 42, textAlign: 'right', color: idx === 0 ? predColor : 'text.secondary' }}>
                    {(pred.confidence * 100).toFixed(1)}%
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        <Collapse in={expanded}>
          {diagnosis.description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
              {diagnosis.description}
            </Typography>
          )}
          {diagnosis.actionPlan && (
            <Box sx={{ mb: 2 }}>
              <ActionPlan actions={diagnosis.actionPlan} />
            </Box>
          )}
        </Collapse>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            sx={{ color: 'primary.main', fontWeight: 500, fontSize: '0.8rem' }}
          >
            {expanded ? 'Menos detalhes' : 'Ver detalhes'}
          </Button>
          {onSave && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => onSave(diagnosis)}
              sx={{ fontWeight: 500, fontSize: '0.8rem', ml: 'auto' }}
            >
              Salvar
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default DiagnosisCard;
