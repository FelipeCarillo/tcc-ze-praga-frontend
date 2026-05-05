import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  AlertTriangle, AlertCircle, Info, CheckCircle2,
  ChevronDown, ChevronUp, Cpu, Bookmark, BookmarkCheck,
} from 'lucide-react';
import ActionPlan from '../Diagnosis/ActionPlan';

const SEVERITY = {
  alta: { label: 'Severa', icon: AlertTriangle, paletteKey: 'error' },
  media: { label: 'Moderada', icon: AlertCircle, paletteKey: 'warning' },
  baixa: { label: 'Leve', icon: Info, paletteKey: 'success' },
  nenhuma: { label: 'Saudável', icon: CheckCircle2, paletteKey: 'success' },
};

const MODEL_NAMES = {
  resnet50: 'ResNet-50',
  efficientnet: 'EfficientNet-B4',
  vit: 'ViT-B/16',
  ensemble: 'Ensemble',
};

function confidenceColor(theme, value) {
  if (value >= 0.9) return theme.palette.success.main;
  if (value >= 0.7) return theme.palette.warning.main;
  return theme.palette.error.main;
}

function DiagnosisCard({ diagnosis, onSave }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const sev = SEVERITY[diagnosis.severity] || SEVERITY.nenhuma;
  const SevIcon = sev.icon;
  const sevColor = theme.palette[sev.paletteKey].main;
  const confColor = confidenceColor(theme, diagnosis.confidence);
  const confPercent = (diagnosis.confidence * 100).toFixed(1);

  const handleSave = () => {
    onSave?.(diagnosis);
    setSaved(true);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        mt: 1.5,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.07)}`,
      }}
    >
      {/* Severity accent bar */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${sevColor}, ${alpha(sevColor, 0.3)})`,
        }}
      />

      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2, mb: 0.3 }}>
              {diagnosis.name || diagnosis.disease}
            </Typography>
            {diagnosis.scientificName && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontStyle: 'italic', display: 'block', lineHeight: 1.4 }}
              >
                {diagnosis.scientificName}
              </Typography>
            )}
          </Box>
          <Chip
            icon={<SevIcon size={13} />}
            label={sev.label}
            size="small"
            sx={{
              backgroundColor: alpha(sevColor, 0.12),
              color: sevColor,
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 26,
              flexShrink: 0,
              ml: 1,
              '& .MuiChip-icon': { color: sevColor, ml: '6px' },
            }}
          />
        </Box>

        {/* Confidence */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: alpha(confColor, 0.06),
            border: '1px solid',
            borderColor: alpha(confColor, 0.15),
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Confiança do modelo
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: '1.6rem',
                lineHeight: 1,
                color: confColor,
                letterSpacing: '-0.03em',
              }}
            >
              {confPercent}
              <Box component="span" sx={{ fontSize: '0.8rem', fontWeight: 600, ml: 0.3 }}>%</Box>
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={diagnosis.confidence * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(confColor, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${confColor}, ${alpha(confColor, 0.6)})`,
                transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
              },
            }}
          />
        </Box>

        {/* Model */}
        {diagnosis.modelUsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
            <Cpu size={13} color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary">
              {MODEL_NAMES[diagnosis.modelUsed] || diagnosis.modelUsed}
            </Typography>
          </Box>
        )}

        {/* Top 3 */}
        {diagnosis.top3 && diagnosis.top3.length > 1 && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: 'surface.sunken',
              border: '1px solid',
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.25 }}>
              Top 3 classificações
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
              {diagnosis.top3.map((pred, i) => {
                const predColor = i === 0 ? confColor : theme.palette.text.disabled;
                return (
                  <Box key={pred.diseaseId || i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        width: 16,
                        fontWeight: 700,
                        color: i === 0 ? confColor : 'text.disabled',
                        fontSize: '0.68rem',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </Typography>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        flex: 1,
                        fontWeight: i === 0 ? 600 : 400,
                        color: i === 0 ? 'text.primary' : 'text.secondary',
                        fontSize: '0.76rem',
                      }}
                    >
                      {pred.disease}
                    </Typography>
                    <Box sx={{ width: 56, flexShrink: 0 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pred.confidence * 100}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(predColor, 0.12),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            backgroundColor: predColor,
                          },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        minWidth: 38,
                        textAlign: 'right',
                        fontWeight: i === 0 ? 700 : 500,
                        color: predColor,
                        fontSize: '0.72rem',
                      }}
                    >
                      {(pred.confidence * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Expandable details */}
        <Collapse in={expanded}>
          {diagnosis.description && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 2, fontSize: '0.82rem' }}
            >
              {diagnosis.description}
            </Typography>
          )}
          {diagnosis.actionPlan && (
            <Box sx={{ mb: 2 }}>
              <ActionPlan actions={diagnosis.actionPlan} />
            </Box>
          )}
        </Collapse>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Button
            size="small"
            onClick={() => setExpanded((v) => !v)}
            endIcon={
              expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            }
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.78rem',
              px: 1,
              py: 0.5,
              borderRadius: '8px',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.07),
              },
            }}
          >
            {expanded ? 'Menos detalhes' : 'Ver detalhes'}
          </Button>

          {onSave && (
            <Button
              size="small"
              variant={saved ? 'text' : 'outlined'}
              startIcon={saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              onClick={handleSave}
              disabled={saved}
              sx={{
                ml: 'auto',
                fontWeight: 600,
                fontSize: '0.78rem',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                color: saved ? 'success.main' : 'primary.main',
                borderColor: saved ? 'transparent' : alpha(theme.palette.primary.main, 0.4),
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                '&.Mui-disabled': {
                  color: 'success.main',
                },
              }}
            >
              {saved ? 'Salvo' : 'Salvar'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default DiagnosisCard;
