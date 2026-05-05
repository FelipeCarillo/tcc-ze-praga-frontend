import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Check, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  PLAN_DETAILS,
  listPlans,
} from '../services/subscriptionService';

function formatLimit(value, suffix) {
  return value === null ? 'Ilimitado' : `${value} ${suffix}`;
}

function getPlanLabel(details) {
  return details.title.replace(/^Plano\s+/, '');
}

function PlanCard({ plan, current, disabled, onSelect }) {
  const theme = useTheme();
  const details = PLAN_DETAILS[plan.name];
  const isFree = plan.name === 'free';
  const featuredBg =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.18)
      : alpha(theme.palette.primary.light, 0.16);

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        backgroundColor: details.highlight ? featuredBg : 'background.paper',
        border: details.highlight ? '2px solid' : '1px solid',
        borderColor: details.highlight ? 'primary.main' : 'divider',
        boxShadow: details.highlight
          ? `0 12px 28px ${alpha(theme.palette.primary.main, 0.18)}`
          : 'none',
        position: 'relative',
      }}
    >
      {details.highlight && (
        <Chip
          label="Mais escolhido"
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 700,
            borderRadius: 999,
            backgroundColor: 'primary.dark',
            color: 'primary.light',
          }}
        />
      )}
      <CardContent sx={{ p: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Chip
          label={getPlanLabel(details)}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            mb: 2,
            borderRadius: 999,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontWeight: 700,
          }}
        />
        <Typography variant="h4" sx={{ mb: 1 }}>
          {details.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48 }}>
          {details.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, my: 3 }}>
          <Typography variant="h2" sx={{ color: 'primary.main' }}>
            {details.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {details.period}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gap: 1.25, mb: 3 }}>
          {details.features.map((feature) => (
            <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={14} />
              </Box>
              <Typography variant="body2">{feature}</Typography>
            </Box>
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">
          Chat: {formatLimit(plan.chat_daily_limit, 'por dia')} · Inferência:{' '}
          {formatLimit(plan.inference_daily_limit, 'por dia')} · API:{' '}
          {formatLimit(plan.api_monthly_limit, 'por mês')}
        </Typography>
        <Button
          fullWidth
          variant={details.highlight ? 'contained' : 'outlined'}
          onClick={() => onSelect(plan)}
          disabled={current || disabled || isFree}
          sx={{ mt: 'auto', pt: 1.2, pb: 1.2, borderRadius: 999 }}
        >
          {current ? 'Plano atual' : isFree ? 'Incluído no acesso' : 'Assinar plano'}
        </Button>
      </CardContent>
    </Card>
  );
}

function PlansPage() {
  const theme = useTheme();
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    listPlans()
      .then((items) => {
        setPlans(items);
        setError('');
      })
      .catch(() => setError('Não foi possível carregar os planos agora.'))
      .finally(() => setLoading(false));
  }, []);

  const currentPlanName = user?.subscription?.is_active ? user.subscription.plan.name : 'free';
  const activePlan = useMemo(
    () => plans.find((plan) => plan.name === currentPlanName),
    [currentPlanName, plans]
  );

  const handleSelect = (plan) => {
    if (!user) {
      navigate('/login', { state: { from: '/planos' } });
      return;
    }

    if (plan.name === 'free') return;

    navigate(`/planos/pagamento/${plan.name}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Crown size={28} color={theme.palette.primary.dark} />
        <Typography variant="h3">Planos</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mb: 3 }}>
        Escolha o plano ideal para o volume de diagnósticos da sua lavoura e amplie seus limites de
        uso conforme a rotina da propriedade.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {activePlan && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Sua assinatura atual é o {PLAN_DETAILS[activePlan.name].title}.
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              current={currentPlanName === plan.name}
              disabled={false}
              onSelect={handleSelect}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}

export default PlansPage;
