import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Activity, Crown, LogOut, Mail, Save, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PLAN_DETAILS } from '../services/subscriptionService';

const DEFAULT_PROFILE_NAME = 'Produtor';

function UsageRow({ label, value }) {
  const percent = value.limit ? Math.min(100, (value.used / value.limit) * 100) : 0;
  const count = value.limit === null ? 'Ilimitado' : `${value.used}/${value.limit}`;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'action.disabledBackground',
          '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: 'primary.main' },
        }}
      />
    </Box>
  );
}

function ProfilePage() {
  const theme = useTheme();
  const { user, loading, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true, state: { from: '/perfil' } });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', email: user.email || '' });
    }
  }, [user]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(form);
      setMessage('Perfil atualizado com sucesso.');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const usage = user.usage || {
    chat: { used: 0, limit: 10 },
    inference: { used: 0, limit: 5 },
    api: { used: 0, limit: 0 },
  };
  const subscription = user.subscription?.is_active ? user.subscription : null;
  const activePlan = subscription?.plan;
  const planTitle = activePlan ? PLAN_DETAILS[activePlan.name]?.title || activePlan.display_name : 'Plano Gratuito';
  const initials = (user.full_name || user.email || 'ZP')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <UserRound size={28} color={theme.palette.primary.dark} />
            <Typography variant="h3">Perfil</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Gerencie os dados da sua conta e acompanhe o uso previsto do plano gratuito.
          </Typography>
        </Box>
        <Button color="error" variant="outlined" startIcon={<LogOut size={18} />} onClick={handleLogout}>
          Sair
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)' },
          gap: 3,
        }}
      >
        <Card sx={{ borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2.5,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  {user.full_name || DEFAULT_PROFILE_NAME}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                  {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Estas informações ficam salvas para manter sua sessão ativa neste dispositivo.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setEditing((prev) => !prev)}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                {editing ? 'Fechar edição' : 'Editar informações'}
              </Button>
            </Box>

            {message && (
              <Alert severity="success" sx={{ mt: 3, mb: 2 }}>
                {message}
              </Alert>
            )}

            <Collapse in={editing}>
              <Divider sx={{ my: 3 }} />
              <Box component="form" onSubmit={handleSave}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  required
                  label="E-mail"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />
                <Button type="submit" variant="contained" startIcon={<Save size={18} />} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Crown size={20} color="#F4A261" />
                <Typography variant="h5">Assinatura</Typography>
              </Box>
              <Chip
                label={planTitle}
                color="success"
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {subscription
                  ? 'Sua assinatura está ativa e seus limites já foram atualizados para este perfil.'
                  : 'Você está no plano gratuito. Ative um plano pago para ampliar limites e acessar recursos avançados.'}
              </Typography>
              <Button component={Link} to="/planos" variant="outlined">
                {subscription ? 'Trocar plano' : 'Ver planos'}
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Activity size={20} color={theme.palette.primary.dark} />
                <Typography variant="h5">Uso</Typography>
              </Box>
              <UsageRow label="Chat diário" value={usage.chat} />
              <UsageRow label="Inferências diárias" value={usage.inference} />
              <UsageRow label="Chamadas de API mensais" value={usage.api || { used: 0, limit: 0 }} />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Mail size={16} />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}

export default ProfilePage;
