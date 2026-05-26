import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ChevronLeft, Camera, Copy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PLAN_DETAILS, listPlans, subscribeToPlan, usageFromPlan } from '../services/subscriptionService';
import { copy } from '../copy/ze';

const TABS = [
  { key: 'pix', label: '⚡ Pix' },
  { key: 'card', label: 'Cartão' },
  { key: 'boleto', label: 'Boleto' },
];

function onlyDigits(v, n) { return v.replace(/\D/g, '').slice(0, n); }
function formatCard(v) { return onlyDigits(v, 16).replace(/(\d{4})(?=\d)/g, '$1 '); }

function PaymentPage() {
  const { planName } = useParams();
  const { user, syncUser } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pix');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', cpf: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: `/planos/pagamento/${planName}` } });
      return;
    }
    listPlans()
      .then((items) => {
        const sel = items.find((i) => i.name === planName);
        if (!sel || sel.name === 'free') navigate('/planos', { replace: true });
        else setPlan(sel);
      })
      .catch(() => setError('Não consegui carregar o plano.'))
      .finally(() => setLoading(false));
  }, [navigate, planName, user]);

  const confirm = async () => {
    if (!plan || !user) return;
    setSubmitting(true);
    setError('');
    try {
      const subscription = await subscribeToPlan(plan.name);
      syncUser({ ...user, subscription, usage: usageFromPlan(subscription.plan) });
      setSuccess(true);
    } catch {
      setError('Não consegui ativar a assinatura. Tenta de novo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!plan) return null;

  const details = PLAN_DETAILS[plan.name] || {};

  if (success) {
    return (
      <Box sx={{ maxWidth: 460, mx: 'auto', px: 3, py: 6, textAlign: 'center' }}>
        <Box component="svg" viewBox="0 0 100 100" sx={{ width: 92, mx: 'auto', mb: 2 }} xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="44" fill="#1F5A3D" />
          <path d="M30 52 L44 66 L72 36" stroke="#F4C95D" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Box>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyHand, color: 'secondary.main', fontSize: '1.6rem' }}>
          {copy.payment.successKicker}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>{copy.payment.successTitle}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {(details.title || plan.name)} ativo. Diagnósticos ampliados e selo no perfil já valendo.
        </Typography>
        <Button component={Link} to="/chat" variant="contained" color="secondary" size="large" startIcon={<Camera size={20} />}>
          Voltar pro Zé
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/planos')} size="small" aria-label="Voltar" sx={{ color: 'text.secondary' }}>
          <ChevronLeft size={20} />
        </IconButton>
        <Box>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700 }}>
            Plano {(details.title || plan.name).replace(/^Plano\s+/, '')}
          </Typography>
          <Typography variant="caption" color="text.secondary">{details.price}{details.period}</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, borderRadius: 999, backgroundColor: (t) => t.palette.surface.sunken, mb: 2.5 }}>
        {TABS.map((tb) => (
          <Box
            key={tb.key}
            onClick={() => setTab(tb.key)}
            sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: 999, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, bgcolor: tab === tb.key ? 'primary.main' : 'transparent', color: tab === tb.key ? (t) => t.palette.brand.milho : 'text.secondary' }}
          >
            {tb.label}
          </Box>
        ))}
      </Box>

      {tab === 'pix' && (
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 180, height: 180, mx: 'auto', mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'grid', placeItems: 'center', backgroundColor: '#fff' }}>
            <Box component="svg" viewBox="0 0 100 100" sx={{ width: 150, height: 150 }} xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="28" height="28" fill="#1C2A20" />
              <rect x="66" y="6" width="28" height="28" fill="#1C2A20" />
              <rect x="6" y="66" width="28" height="28" fill="#1C2A20" />
              <rect x="42" y="42" width="10" height="10" fill="#1C2A20" />
              <rect x="58" y="58" width="14" height="14" fill="#1C2A20" />
              <rect x="78" y="60" width="10" height="10" fill="#1C2A20" />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Aponta a câmera do banco</Typography>
          <Button startIcon={<Copy size={14} />} size="small" sx={{ mb: 2, color: 'text.secondary' }}>Copiar código Pix</Button>
          <Button fullWidth variant="contained" color="secondary" onClick={confirm} disabled={submitting} sx={{ py: 1.25 }}>
            {submitting ? 'Confirmando…' : 'Já fiz o Pix'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>{copy.payment.waitingPix}</Typography>
        </Box>
      )}

      {tab === 'card' && (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); confirm(); }}>
          <TextField fullWidth label="Número do cartão" value={formatCard(card.number)} onChange={(e) => setCard((c) => ({ ...c, number: onlyDigits(e.target.value, 16) }))} placeholder="5172 0000 0000 4321" sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField label="Validade" value={card.expiry} onChange={(e) => { const d = onlyDigits(e.target.value, 4); setCard((c) => ({ ...c, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d })); }} placeholder="12/28" />
            <TextField label="CVV" value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: onlyDigits(e.target.value, 3) }))} placeholder="123" />
          </Box>
          <TextField fullWidth label="CPF do titular" value={card.cpf} onChange={(e) => setCard((c) => ({ ...c, cpf: onlyDigits(e.target.value, 11) }))} placeholder="123.456.789-00" sx={{ mb: 2.5 }} />
          <Button fullWidth type="submit" variant="contained" color="secondary" disabled={submitting || card.number.length < 16 || card.cvc.length < 3} sx={{ py: 1.25 }}>
            {submitting ? 'Ativando…' : `Confirmar ${details.price}${details.period}`}
          </Button>
        </Box>
      )}

      {tab === 'boleto' && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Geramos um boleto pro seu e-mail. A ativação ocorre na compensação (até 2 dias úteis).
          </Typography>
          <Button fullWidth variant="contained" color="secondary" onClick={confirm} disabled={submitting} sx={{ py: 1.25 }}>
            {submitting ? 'Gerando…' : 'Gerar boleto e ativar'}
          </Button>
        </Box>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>Tela de simulação — nenhuma cobrança real é feita.</Alert>
    </Box>
  );
}

export default PaymentPage;
