import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowLeft, CreditCard, Leaf, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  PLAN_DETAILS,
  listPlans,
  subscribeToPlan,
  usageFromPlan,
} from '../services/subscriptionService';

function formatLimit(value, suffix) {
  return value === null ? 'Ilimitado' : `${value} ${suffix}`;
}

function getPlanLabel(details) {
  return details.title.replace(/^Plano\s+/, '');
}

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;

function onlyDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function formatExpiry(value) {
  const digits = onlyDigits(value, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function formatCardNumber(value) {
  return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function sanitizeName(value) {
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '').replace(/\s{2,}/g, ' ').slice(0, 80);
}

function PaymentPage() {
  const theme = useTheme();
  const { planName } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState({
    holder: '',
    number: '',
    expiry: '',
    cvc: '',
  });
  const { user, syncUser } = useAuth();
  const navigate = useNavigate();
  const paymentValid =
    NAME_PATTERN.test(payment.holder.trim()) &&
    payment.number.length === 16 &&
    EXPIRY_PATTERN.test(payment.expiry) &&
    payment.cvc.length === 3;

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: `/planos/pagamento/${planName}` } });
      return;
    }

    setError('');
    listPlans()
      .then((items) => {
        const selected = items.find((item) => item.name === planName);
        if (!selected || selected.name === 'free') {
          navigate('/planos', { replace: true });
          return;
        }
        setPlan(selected);
      })
      .catch(() => setError('Não foi possível carregar o plano selecionado.'))
      .finally(() => setLoading(false));
  }, [navigate, planName, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = {
      holder: sanitizeName(value),
      number: onlyDigits(value, 16),
      expiry: formatExpiry(value),
      cvc: onlyDigits(value, 3),
    }[name] ?? value;

    setPayment((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!plan || !user || !paymentValid) return;

    setSubmitting(true);
    setError('');
    try {
      const subscription = await subscribeToPlan(plan.name);
      syncUser({
        ...user,
        subscription,
        usage: usageFromPlan(subscription.plan),
      });
      setPayment({ holder: '', number: '', expiry: '', cvc: '' });
      navigate('/perfil', { replace: true });
    } catch {
      setError('Não foi possível ativar a assinatura. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plan) {
    return error ? (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/planos')}
          sx={{ mb: 3, color: 'text.secondary' }}
        >
          Voltar aos planos
        </Button>
        <Alert severity="error">{error}</Alert>
      </Container>
    ) : null;
  }

  const details = PLAN_DETAILS[plan.name];
  const summaryBg =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.18)
      : alpha(theme.palette.primary.light, 0.16);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={() => navigate('/planos')}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Voltar aos planos
      </Button>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 420px' }, gap: 3 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} />
              </Box>
              <Typography variant="h5">Pagamento seguro</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Preencha os dados para simular a ativação. Nenhuma cobrança real é realizada.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                label="Nome impresso no cartão"
                name="holder"
                value={payment.holder}
                onChange={handleChange}
                error={Boolean(payment.holder) && !NAME_PATTERN.test(payment.holder.trim())}
                helperText="Use apenas letras e espaços."
                inputProps={{ maxLength: 80 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                required
                label="Número do cartão"
                name="number"
                value={formatCardNumber(payment.number)}
                onChange={handleChange}
                placeholder="4242 4242 4242 4242"
                helperText="Digite os 16 números do cartão."
                inputProps={{ inputMode: 'numeric', maxLength: 19, pattern: '[0-9 ]*' }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <TextField
                  required
                  label="Validade"
                  name="expiry"
                  value={payment.expiry}
                  onChange={handleChange}
                  placeholder="12/30"
                  error={payment.expiry.length === 5 && !EXPIRY_PATTERN.test(payment.expiry)}
                  helperText="Formato MM/YY."
                  inputProps={{ inputMode: 'numeric', maxLength: 5, pattern: '(0[1-9]|1[0-2])/[0-9]{2}' }}
                />
                <TextField
                  required
                  label="CVC"
                  name="cvc"
                  value={payment.cvc}
                  onChange={handleChange}
                  placeholder="123"
                  helperText="3 dígitos."
                  inputProps={{ inputMode: 'numeric', maxLength: 3, pattern: '[0-9]{3}' }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                startIcon={<CreditCard size={18} />}
                disabled={submitting || !paymentValid}
                sx={{ borderRadius: 999 }}
              >
                {submitting ? 'Ativando...' : 'Ativar assinatura'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            backgroundColor: summaryBg,
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.18)}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Leaf size={20} color={theme.palette.primary.dark} />
                <Typography variant="h5">Resumo</Typography>
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: 'primary.dark',
                  color: 'primary.light',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {getPlanLabel(details)}
              </Box>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {details.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {details.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2 }}>
              <Typography variant="h3" sx={{ color: 'primary.main' }}>
                {details.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {details.period}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            {[
              ['Chat', formatLimit(plan.chat_daily_limit, 'por dia')],
              ['Inferência', formatLimit(plan.inference_daily_limit, 'por dia')],
              ['API', formatLimit(plan.api_monthly_limit, 'por mês')],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {value}
                </Typography>
              </Box>
            ))}
            <Alert severity="info" sx={{ mt: 3 }}>
              Esta tela simula o pagamento e ativa o plano no seu perfil.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default PaymentPage;
