import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '../hooks/useAuth';
import { resendVerification, forgotPassword } from '../services/authService';
import { ReactComponent as Marca } from '../assets/brand/marca.svg';
import { copy } from '../copy/ze';

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // E-mail pendente de confirmação — preenchido quando o backend responde 202.
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  // Modo "esqueci minha senha": troca o formulário por um pedido de e-mail.
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/perfil';

  // O backend redireciona pra cá depois do clique no link do e-mail
  // (GET /api/v1/auth/verify → 303 /login?verificado=1|erro).
  const params = new URLSearchParams(location.search);
  const verificado = params.get('verificado');
  // A tela de redefinição manda pra cá depois de trocar a senha.
  const senhaRedefinida = params.get('senha') === 'redefinida';

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendMsg('');
    setSubmitting(true);
    try {
      if (isRegistering) {
        const result = await register(form);
        if (result?.pendingVerification) {
          setPendingEmail(result.email || form.email);
          return;
        }
      } else {
        await login(form);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // 401 com a conta ainda não confirmada tem mensagem própria — repetir
      // "confere os dados" mandaria o usuário caçar um erro que não existe.
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string' && detail.includes('Confirme seu e-mail')
          ? 'Sua conta ainda não foi confirmada. Procure o link que enviamos por e-mail.'
          : 'Não consegui te autenticar. Confere os dados e tenta de novo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg('');
    setSubmitting(true);
    try {
      await forgotPassword(form.email);
      // Mensagem propositalmente vaga: o backend responde igual exista ou não a
      // conta, e a tela não pode contradizer isso revelando quem tem cadastro.
      setForgotMsg('Se existir uma conta com esse e-mail, o link de redefinição já está a caminho.');
    } catch (err) {
      setError(
        err?.response?.status === 429
          ? 'Muitos pedidos seguidos. Espera um pouco antes de tentar de novo.'
          : 'Não consegui enviar agora. Tenta de novo em instantes.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendMsg('');
    try {
      await resendVerification(pendingEmail);
      setResendMsg('Reenviei o link. Dá uma olhada na caixa de entrada e no spam.');
    } catch {
      setResendMsg('Não consegui reenviar agora. Tenta de novo em instantes.');
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
          {pendingEmail
            ? 'Confirma teu e-mail'
            : forgotMode
              ? 'Esqueceu a senha?'
              : isRegistering
                ? 'Criar conta'
                : copy.login.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {pendingEmail
            ? 'Falta só um passo pra tua conta ficar de pé.'
            : forgotMode
              ? 'Põe teu e-mail que eu mando um link pra criar uma nova.'
              : isRegistering
                ? 'Preenche os dados pra começar.'
                : copy.login.subtitle}
        </Typography>

        {verificado === '1' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            E-mail confirmado! Agora é só entrar.
          </Alert>
        )}
        {verificado === 'erro' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esse link não vale mais — ou já foi usado, ou passou da validade. Cria a conta de novo
            ou pede um link novo.
          </Alert>
        )}
        {senhaRedefinida && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Senha redefinida! Entra com a nova.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {pendingEmail ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Mandei um link de confirmação pra <strong>{pendingEmail}</strong>. Clica nele pra
              ativar a conta — vale por 24 horas. Se não achar, olha no spam.
            </Alert>
            {resendMsg && <Alert severity="success" sx={{ mb: 2 }}>{resendMsg}</Alert>}
            <Button fullWidth variant="outlined" color="primary" onClick={handleResend} sx={{ mb: 1.5, py: 1.25 }}>
              Reenviar o link
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setPendingEmail('');
                setIsRegistering(false);
                setResendMsg('');
              }}
              sx={{ color: 'primary.main' }}
            >
              Já confirmei — quero entrar
            </Button>
          </Box>
        ) : forgotMode ? (
          <Box component="form" onSubmit={handleForgot}>
            {forgotMsg && <Alert severity="success" sx={{ mb: 2 }}>{forgotMsg}</Alert>}
            <TextField fullWidth required label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} sx={{ mb: 2.5 }} />
            <Button fullWidth type="submit" variant="contained" color="secondary" disabled={submitting} sx={{ py: 1.25 }}>
              {submitting ? 'Enviando…' : 'Mandar o link'}
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="text" onClick={() => { setForgotMode(false); setForgotMsg(''); setError(''); }} sx={{ color: 'primary.main' }}>
                Voltar pro login
              </Button>
            </Box>
          </Box>
        ) : (
          <>
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
              {!isRegistering && (
                <Button variant="text" onClick={() => { setForgotMode(true); setError(''); }} sx={{ display: 'block', mx: 'auto', color: 'text.secondary', fontSize: '0.85rem' }}>
                  Esqueci minha senha
                </Button>
              )}
            </Box>
          </>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          {copy.login.optionalNote} <Box component={Link} to="/chat" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>Voltar pro Zé</Box>
        </Typography>
      </Box>

    </Box>
  );
}

export default LoginPage;
