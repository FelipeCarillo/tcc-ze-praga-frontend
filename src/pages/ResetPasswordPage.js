import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { resetPassword } from '../services/authService';
import { ReactComponent as Marca } from '../assets/brand/marca.svg';

/**
 * Destino do link do e-mail de redefinição (TCC-092).
 *
 * Diferente da confirmação de conta — que é só um clique e por isso vai direto
 * pro backend — aqui o usuário precisa de uma tela pra digitar a senha nova.
 */
function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('As duas senhas não são iguais.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, password: form.password });
      setDone(true);
      // Leva pro login já com o aviso de sucesso, em vez de deixar o usuário
      // parado numa tela que não serve mais.
      setTimeout(() => navigate('/login?senha=redefinida', { replace: true }), 1600);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError('Muitas tentativas. Espera um pouco e tenta de novo.');
      } else if (status === 401) {
        setError('Esse link não vale mais — ou já foi usado, ou passou das 2 horas. Pede um novo.');
      } else {
        setError('Não consegui redefinir agora. Tenta de novo em instantes.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 3, md: 6 },
        maxWidth: 440,
        mx: 'auto',
        width: '100%',
        minHeight: { md: 'calc(100vh - 65px)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Marca style={{ width: 30, height: 30, display: 'block' }} />
        <Typography
          sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 800, color: 'primary.main' }}
        >
          Zé Praga
        </Typography>
      </Box>

      <Typography variant="h3" sx={{ mb: 1 }}>
        Nova senha
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Escolhe uma senha nova pra tua conta.
      </Typography>

      {!token && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esse endereço veio sem o código de redefinição. Abre o link direto do e-mail que te
          mandei.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {done && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Senha trocada! Te levando pro login…
        </Alert>
      )}

      {!done && (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Nova senha"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            inputProps={{ minLength: 6 }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            label="Repete a nova senha"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            inputProps={{ minLength: 6 }}
            sx={{ mb: 2.5 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="secondary"
            disabled={submitting || !token}
            sx={{ py: 1.25 }}
          >
            {submitting ? 'Trocando…' : 'Trocar senha'}
          </Button>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
        <Box
          component={Link}
          to="/login"
          sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
        >
          Voltar pro login
        </Box>
      </Typography>
    </Box>
  );
}

export default ResetPasswordPage;
