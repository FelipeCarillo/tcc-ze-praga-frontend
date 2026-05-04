import React, { useEffect, useState } from 'react';
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
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Activity, Crown, LogOut, Mail, Save, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function UsageRow({ label, value }) {
  const percent = value.limit ? Math.min(100, (value.used / value.limit) * 100) : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value.used}/{value.limit}
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
  const { user, loading, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '' });
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
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <UserRound size={28} color="#2D6A4F" />
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
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Dados da conta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Estas informações ficam salvas para manter sua sessão ativa neste dispositivo.
            </Typography>

            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

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
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Crown size={20} color="#F4A261" />
                <Typography variant="h5">Assinatura</Typography>
              </Box>
              <Chip label="Inativa" color="warning" size="small" sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ative um plano para ampliar limites, acompanhar mais diagnósticos e acessar recursos
                avançados quando estiverem disponíveis.
              </Typography>
              <Button variant="outlined" disabled>
                Assinar em breve
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Activity size={20} color="#2D6A4F" />
                <Typography variant="h5">Uso</Typography>
              </Box>
              <UsageRow label="Chat diário" value={usage.chat} />
              <UsageRow label="Inferências diárias" value={usage.inference} />
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
