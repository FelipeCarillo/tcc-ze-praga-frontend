import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PLAN_DETAILS, listPlans } from '../services/subscriptionService';
import { copy } from '../copy/ze';

function PlanCard({ plan, current, onSelect }) {
  const details = PLAN_DETAILS[plan.name] || {};
  const isFree = plan.name === 'free';
  const supporter = !!details.highlight;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 5,
        p: 4,
        border: supporter ? 'none' : '1.5px solid',
        borderColor: 'divider',
        backgroundColor: supporter ? 'primary.main' : 'background.paper',
        color: supporter ? (t) => t.palette.brand.creme : 'text.primary',
        boxShadow: supporter ? '0 30px 60px -30px rgba(31,90,61,0.5)' : 'none',
      }}
    >
      {supporter && (
        <Box sx={{ position: 'absolute', top: -12, left: 28, px: 1.5, py: 0.5, borderRadius: 999, bgcolor: 'secondary.main', color: '#fff', fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.62rem', fontWeight: 700 }}>
          ★ APOIE O PROJETO
        </Box>
      )}
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: supporter ? (t) => t.palette.brand.milho : 'text.secondary' }}>
        {isFree ? 'Produtor' : 'Apoiador'}
      </Typography>
      <Typography variant="h3" sx={{ color: supporter ? (t) => t.palette.brand.milho : 'text.primary', mt: 0.5 }}>
        {(details.title || plan.name).replace(/^Plano\s+/, '')}
      </Typography>
      <Typography variant="body2" sx={{ color: supporter ? 'rgba(240,237,226,0.78)' : 'text.secondary', mb: 2, minHeight: 40 }}>
        {details.description}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 3 }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '3rem', lineHeight: 1, color: supporter ? (t) => t.palette.brand.milho : 'text.primary' }}>
          {details.price}
        </Typography>
        <Typography variant="body2" sx={{ color: supporter ? 'rgba(240,237,226,0.7)' : 'text.secondary' }}>{details.period}</Typography>
      </Box>
      <Button
        fullWidth
        variant={supporter ? 'contained' : 'outlined'}
        onClick={() => onSelect(plan)}
        disabled={current || isFree}
        sx={{
          mb: 2.5,
          py: 1.25,
          ...(supporter
            ? { bgcolor: (t) => t.palette.brand.milho, color: 'primary.main', fontWeight: 800, '&:hover': { bgcolor: '#E9BC45' } }
            : { borderColor: 'divider', color: 'text.primary' }),
        }}
      >
        {current ? 'Plano atual' : isFree ? copy.plans.freeCta : copy.plans.supporterCta}
      </Button>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {(details.features || []).map((f) => (
          <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Check size={15} color={supporter ? '#F4C95D' : '#1F5A3D'} />
            <Typography variant="body2" sx={{ color: supporter ? (t) => t.palette.brand.creme : 'text.primary' }}>{f}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    listPlans()
      .then((items) => { setPlans(items); setError(''); })
      .catch(() => setError('Não consegui carregar os planos agora.'))
      .finally(() => setLoading(false));
  }, []);

  const currentPlanName = user?.subscription?.is_active ? user.subscription.plan.name : 'free';

  const handleSelect = (plan) => {
    if (!user) return navigate('/login', { state: { from: '/planos' } });
    if (plan.name === 'free') return;
    navigate(`/planos/pagamento/${plan.name}`);
  };

  // Mostra os 2 primeiros planos como cards principais; o restante (ex.: API) vira bloco dev.
  const mainPlans = plans.slice(0, 2);

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 5, md: 7 } }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'secondary.main', fontWeight: 700 }}>
          Planos
        </Typography>
        <Typography variant="h2" sx={{ mt: 1, mb: 1.5 }}>{copy.plans.title}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
          {copy.plans.subtitle}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

      {!loading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {mainPlans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} current={currentPlanName === plan.name} onSelect={handleSelect} />
          ))}
        </Box>
      )}

      {/* Bloco API (dev) */}
      <Box sx={{ mt: 7 }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary', mb: 1 }}>
          Para desenvolvedores
        </Typography>
        <Box sx={{ borderRadius: 4, p: { xs: 3, md: 4 }, backgroundColor: (t) => t.palette.brand.solo, color: (t) => t.palette.brand.creme, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ color: (t) => t.palette.brand.milho, mb: 1 }}>Integre o Zé no seu app</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
              Cooperativa, ERP de fazenda, app de revenda… Use a API do Zé pra classificar folhas
              direto do seu sistema.
            </Typography>
            <Button component={Link} to="/api-docs" endIcon={<ArrowRight size={18} />} sx={{ bgcolor: (t) => t.palette.brand.milho, color: (t) => t.palette.brand.mata, fontWeight: 800, '&:hover': { bgcolor: '#E9BC45' } }}>
              Ver a documentação
            </Button>
          </Box>
          <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 2.5, bgcolor: 'rgba(0,0,0,0.35)', fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.72rem', color: (t) => t.palette.brand.folha, overflow: 'auto' }}>
{`curl -X POST \\
  api.zepraga.com.br/v1/classify \\
  -H "Authorization: Bearer ze_..." \\
  -F "image=@folha.jpg"`}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default PlansPage;
