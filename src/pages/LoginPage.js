import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '../hooks/useAuth';
import { ReactComponent as Marca } from '../assets/brand/marca.svg';
import { copy } from '../copy/ze';

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/perfil';

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegistering) await register(form);
      else await login(form);
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Não consegui te autenticar. Confere os dados e tenta de novo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, minHeight: { md: 'calc(100vh - 65px)' } }}>
      {/* Lado mata (desktop) */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: 6, background: 'linear-gradient(160deg, #1F5A3D, #0F3D27)', color: (t) => t.palette.brand.creme }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Marca style={{ width: 36, height: 36, display: 'block' }} />
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 800, fontSize: '1.3rem', color: (t) => t.palette.brand.milho }}>
            Zé Praga
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyHand, color: (t) => t.palette.brand.milho, fontSize: '1.8rem', mb: 1 }}>
            {copy.login.kicker}
          </Typography>
          <Typography variant="h2" sx={{ color: (t) => t.palette.brand.creme }}>
            Bom te ver por aqui, compadre.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Não precisa de conta pra usar o chat — login é só pra guardar histórico e API.
        </Typography>
      </Box>

      {/* Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 3, md: 6 }, maxWidth: 440, mx: 'auto', width: '100%' }}>
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 2 }}>
          <Marca style={{ width: 30, height: 30, display: 'block' }} />
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 800, color: 'primary.main' }}>Zé Praga</Typography>
        </Box>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyHand, color: 'secondary.main', fontSize: '1.5rem' }}>
          {copy.login.kicker}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {isRegistering ? 'Criar conta' : copy.login.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isRegistering ? 'Preenche os dados pra começar.' : copy.login.subtitle}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          {isRegistering && (
            <TextField fullWidth label="Nome" name="full_name" value={form.full_name} onChange={handleChange} sx={{ mb: 2 }} />
          )}
          <TextField fullWidth required label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth required label="Senha" name="password" type="password" value={form.password} onChange={handleChange} inputProps={{ minLength: 6 }} sx={{ mb: 2.5 }} />
          <Button fullWidth type="submit" variant="contained" color="secondary" disabled={submitting} sx={{ py: 1.25 }}>
            {submitting ? 'Entrando…' : isRegistering ? 'Criar conta' : 'Entrar'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="text" onClick={() => setIsRegistering((p) => !p)} sx={{ color: 'primary.main' }}>
            {isRegistering ? 'Já tenho conta' : 'Criar uma conta'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          {copy.login.optionalNote} <Box component={Link} to="/chat" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>Voltar pro Zé</Box>
        </Typography>
      </Box>

    </Box>
  );
}

export default LoginPage;
