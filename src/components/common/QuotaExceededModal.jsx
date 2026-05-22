import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AlertTriangle, Crown } from 'lucide-react';

const FEATURE_LABELS = {
  chat: 'Chat',
  inference: 'Inferência',
  api: 'API',
};

function describeFeature(detail) {
  if (!detail) return null;
  const feature = detail.feature || detail.scope || null;
  const used = detail.used ?? detail.current ?? null;
  const limit = detail.limit ?? detail.max ?? null;
  return { feature, used, limit };
}

function QuotaExceededModal() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event) => {
      setDetail(event?.detail || null);
      setOpen(true);
    };
    window.addEventListener('quota-exceeded', handler);
    return () => window.removeEventListener('quota-exceeded', handler);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleGoToPlans = useCallback(() => {
    setOpen(false);
    navigate('/planos');
  }, [navigate]);

  const info = describeFeature(detail);
  const featureLabel = info?.feature ? FEATURE_LABELS[info.feature] || info.feature : null;
  const counter =
    info && info.used !== null && info.limit !== null
      ? `${info.used}/${info.limit}`
      : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="quota-exceeded-title"
      aria-describedby="quota-exceeded-description"
      maxWidth="xs"
      fullWidth
      data-testid="quota-exceeded-modal"
    >
      <DialogTitle id="quota-exceeded-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AlertTriangle size={24} />
        Limite de uso atingido
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="quota-exceeded-description" sx={{ mb: featureLabel ? 1.5 : 0 }}>
          Você atingiu o limite de uso. Veja os planos disponíveis para continuar utilizando o Zé
          Praga sem interrupções.
        </DialogContentText>
        {featureLabel && (
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'action.hover',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }} data-testid="quota-feature">
              Recurso: {featureLabel}
            </Typography>
            {counter && (
              <Typography variant="body2" color="text.secondary" data-testid="quota-counter">
                Uso: {counter}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Fechar
        </Button>
        <Button
          onClick={handleGoToPlans}
          variant="contained"
          color="primary"
          startIcon={<Crown size={18} />}
          data-testid="quota-cta-plans"
        >
          Ver planos
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuotaExceededModal;
