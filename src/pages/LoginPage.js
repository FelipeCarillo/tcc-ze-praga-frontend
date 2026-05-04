import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LogIn, ShieldCheck, Sprout, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: 'produtor@zepraga.com',
    password: '123456',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/perfil';

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegistering) {
        await register(form);
      } else {
        await login(form);
      }
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Não foi possível autenticar. Confira os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 420px' },
          gap: { xs: 4, md: 6 },
          alignItems: 'center',
        }}
      >
        <Box>
          <Chip
            icon={<ShieldCheck size={16} />}
            label="Acesso do produtor"
            sx={{
              mb: 2,
              backgroundColor: 'rgba(45, 106, 79, 0.1)',
              color: 'primary.main',
              fontWeight: 600,
              '& .MuiChip-icon': { color: 'primary.main' },
            }}
          />
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2 }}>
            Entre para acompanhar seus diagnósticos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, lineHeight: 1.8 }}>
            Cadastre-se para salvar seu perfil, acompanhar seus diagnósticos e retomar seu trabalho
            de onde parou.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 4 }}>
            {['Sessão persistente', 'Perfil editável', 'Assinatura planejada'].map((item) => (
              <Box
                key={item}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                <Sprout size={16} color="#52B788" />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {isRegistering ? 'Criar conta' : 'Login'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isRegistering
                ? 'Preencha os dados para iniciar sua sessão.'
                : 'Use os dados preenchidos ou informe outro e-mail.'}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {isRegistering && (
                <TextField
                  fullWidth
                  label="Nome"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              )}
              <TextField
                fullWidth
                required
                label="E-mail"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                required
                label="Senha"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                inputProps={{ minLength: 6 }}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                startIcon={isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                disabled={submitting}
                sx={{ py: 1.25 }}
              >
                {submitting ? 'Entrando...' : isRegistering ? 'Criar conta' : 'Entrar'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Button
              fullWidth
              variant="text"
              onClick={() => setIsRegistering((prev) => !prev)}
              sx={{ color: 'primary.main' }}
            >
              {isRegistering ? 'Já tenho conta' : 'Criar uma conta de teste'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default LoginPage;
