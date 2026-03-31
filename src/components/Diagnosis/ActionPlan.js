import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import { CheckCircle2, AlertTriangle, Zap, Map, GraduationCap, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const levels = [
  { id: 'essencial', label: 'Essencial', icon: Zap, description: 'Ações imediatas' },
  { id: 'campo', label: 'Estratégia de Campo', icon: Map, description: 'Manejo completo' },
  { id: 'especialista', label: 'Visão Especialista', icon: GraduationCap, description: 'Análise técnica' },
];

function ActionPlan({ actions }) {
  const theme = useTheme();
  const [activeLevel, setActiveLevel] = useState('essencial');
  const [showSources, setShowSources] = useState(false);

  const isMultiLevel = actions && typeof actions === 'object' && !Array.isArray(actions);
  const currentActions = isMultiLevel ? actions[activeLevel] : actions;
  const sources = isMultiLevel ? actions.sources : null;

  if (!currentActions || currentActions.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Plano de Ação
      </Typography>

      {isMultiLevel && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Selecione o nível de detalhamento:
          </Typography>
          <ToggleButtonGroup
            value={activeLevel}
            exclusive
            onChange={(e, val) => { if (val) setActiveLevel(val); }}
            size="small"
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              '& .MuiToggleButtonGroup-grouped': {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                mx: 0,
              },
            }}
          >
            {levels.map((level) => {
              const Icon = level.icon;
              const isActive = activeLevel === level.id;
              return (
                <ToggleButton
                  key={level.id}
                  value={level.id}
                  sx={{
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    gap: 1,
                    backgroundColor: isActive ? 'action.selected' : 'transparent',
                    borderColor: isActive ? 'primary.main' : 'divider',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    },
                  }}
                >
                  <Icon size={16} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem', display: 'block', lineHeight: 1.2 }}>
                      {level.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isActive ? 'primary.main' : 'text.disabled', display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}>
                      {level.description}
                    </Typography>
                  </Box>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {currentActions.map((action, index) => {
          const isLongAction = action.includes(' - ') || action.length > 120;
          return (
            <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color={theme.palette.success.main} style={{ marginTop: 3, flexShrink: 0 }} />
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.7,
                  color: 'text.secondary',
                  ...(isLongAction && { fontSize: '0.83rem' }),
                }}
              >
                {action}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 2.5,
          p: 2,
          backgroundColor: alpha(theme.palette.warning.main, 0.2),
          borderRadius: 2,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
          color: 'warning.dark',
        }}
      >
        <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
          Consulte sempre um engenheiro agrônomo para orientação profissional.
        </Typography>
      </Box>

      {sources && sources.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            onClick={() => setShowSources(!showSources)}
            startIcon={<BookOpen size={15} />}
            endIcon={showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.8rem',
              textTransform: 'none',
              '&:hover': { color: 'primary.main', backgroundColor: 'action.hover' },
            }}
          >
            Fontes e Referências ({sources.length})
          </Button>
          <Collapse in={showSources}>
            <Box
              sx={{
                mt: 1,
                p: 2,
                backgroundColor: 'surface.sunken',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {sources.map((source, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.2,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: 'primary.main',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.4, color: 'text.primary' }}>
                        {source.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, display: 'block' }}>
                        {source.detail}
                      </Typography>
                      {source.url && (
                        <Typography
                          component="a"
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 0.3,
                            fontSize: '0.72rem',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          <ExternalLink size={11} />
                          {source.url.replace('https://', '').replace('http://', '')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}

export default ActionPlan;
