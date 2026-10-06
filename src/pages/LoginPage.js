import { IS_DEMO } from "../config/runtime";
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { resendVerification, forgotPassword } from "../services/authService";
import { ReactComponent as Marca } from "../assets/brand/marca.svg";
import { copy } from "../copy/ze";
import lavoura from "../assets/field/lavoura-rs.jpg";

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // E-mail pendente de confirmação — preenchido quando o backend responde 202.
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendFailed, setResendFailed] = useState(false);
  // Modo "esqueci minha senha": troca o formulário por um pedido de e-mail.
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  // O backend redireciona pra cá depois do clique no link do e-mail
  // (GET /api/v1/auth/verify → 303 /login?verificado=1|erro).
  const params = new URLSearchParams(location.search);
  const verificado = params.get("verificado");
  // A tela de redefinição manda pra cá depois de trocar a senha.
  const senhaRedefinida = params.get("senha") === "redefinida";

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setResendFailed(false);
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
      navigate(redirectTo, { replace: true, state: location.state?.fromState });
    } catch (err) {
      // 401 com a conta ainda não confirmada tem mensagem própria — repetir
      // "confere os dados" mandaria o usuário caçar um erro que não existe.
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string" && detail.includes("Confirme seu e-mail")
          ? "Sua conta ainda não foi confirmada. Procure o link que enviamos por e-mail."
          : "Não consegui te autenticar. Confere os dados e tenta de novo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setForgotMsg("");
    setSubmitting(true);
    try {
      await forgotPassword(form.email);
      // Mensagem propositalmente vaga: o backend responde igual exista ou não a
      // conta, e a tela não pode contradizer isso revelando quem tem cadastro.
      setForgotMsg(
        "Se existir uma conta com esse e-mail, o link de redefinição já está a caminho.",
      );
    } catch (err) {
      setError(
        err?.response?.status === 429
          ? "Muitos pedidos seguidos. Espera um pouco antes de tentar de novo."
          : "Não consegui enviar agora. Tenta de novo em instantes.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendMsg("");
    setResendFailed(false);
    try {
      await resendVerification(pendingEmail);
      setResendMsg(
        "Reenviei o link. Dá uma olhada na caixa de entrada e no spam.",
      );
    } catch {
      setResendFailed(true);
      setResendMsg("Não consegui reenviar agora. Tenta de novo em instantes.");
    }
  };

  const enterDemo = async () => {
    setSubmitting(true);
    try {
      await login({ email: "demo@example.test", password: "demo" });
      navigate(redirectTo, { replace: true, state: location.state?.fromState });
    } catch {
      setError("Não foi possível abrir a demonstração.");
    } finally {
      setSubmitting(false);
    }
  };

  const titulo = pendingEmail
    ? "Confirme seu e-mail"
    : forgotMode
      ? "Esqueceu a senha?"
      : isRegistering
        ? "Crie seu caderno de campo."
        : "Bom te ver de novo.";
  const subtitulo = pendingEmail
    ? "Falta só um passo pra tua conta ficar de pé."
    : forgotMode
      ? "Informe seu e-mail para receber o link de recuperação."
      : isRegistering
        ? "Preencha os dados para guardar seus laudos por talhão."
        : "Entre para guardar seus laudos por talhão.";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "1fr 1fr" },
        minHeight: { xs: "100dvh", md: "calc(100vh - 73px)" },
        bgcolor: "background.default",
      }}
    >
      {/* Desktop: foto da lavoura ao lado do formulário. */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "flex-end",
          p: 6,
          backgroundColor: "#0B1510",
          backgroundImage: `linear-gradient(180deg, rgba(11,21,16,.35), rgba(11,21,16,.92)), url(${lavoura})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#EEF2E8",
        }}
      >
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, color: "#C8F169", fontSize: "0.8125rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", mb: 1 }}>
          {copy.login.kicker}
        </Typography>
        <Typography sx={{ color: "#FFFFFF", fontSize: "2.75rem", fontWeight: 800, fontStretch: "112%", letterSpacing: "-0.02em", lineHeight: 1.05, maxWidth: 480 }}>
          Cada laudo no talhão certo, no dia certo.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* m-Login: cabeçalho verde-lavoura. */}
        <Box sx={{ bgcolor: "#1B4D2E", color: "#FFFFFF", px: { xs: 2.5, md: 6 }, pt: 2, pb: 4, display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box
            component={Link}
            to="/"
            aria-label="Voltar ao início"
            sx={{ width: 44, height: 44, ml: -1.25, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </Box>
          <Marca style={{ width: 56, height: 56, display: "block" }} aria-hidden="true" />
          <Box>
            <Typography component="h1" sx={{ m: 0, fontSize: "2rem", fontWeight: 800, fontStretch: "112%", letterSpacing: "-0.02em", lineHeight: 1.05, color: "#FFFFFF" }}>
              {titulo}
            </Typography>
            <Typography sx={{ mt: 1, fontSize: "1rem", lineHeight: 1.5, color: "#D6E4D3" }}>
              {subtitulo}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2.5, md: 6 }, py: 3, display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, maxWidth: { md: 520 }, width: "100%" }}>
          {verificado === "1" && <Alert severity="success">E-mail confirmado! Agora é só entrar.</Alert>}
          {verificado === "erro" && (
            <Alert severity="warning">
              Esse link não vale mais — ou já foi usado, ou passou da validade. Cria a conta de novo ou pede um link novo.
            </Alert>
          )}
          {senhaRedefinida && <Alert severity="success">Senha redefinida! Entra com a nova.</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {pendingEmail ? (
            <>
              <Alert severity="info">
                Mandei um link de confirmação pra <strong>{pendingEmail}</strong>. Clica nele pra ativar a conta — vale por 24 horas. Se não achar, olha no spam.
              </Alert>
              {resendMsg && <Alert severity={resendFailed ? "error" : "success"}>{resendMsg}</Alert>}
              <Button fullWidth variant="outlined" onClick={handleResend} sx={outlineBtn}>
                Reenviar o link
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setPendingEmail("");
                  setIsRegistering(false);
                  setResendMsg("");
                  setResendFailed(false);
                }}
                sx={{ color: "primary.main" }}
              >
                Já confirmei — quero entrar
              </Button>
            </>
          ) : forgotMode ? (
            <Box component="form" onSubmit={handleForgot} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {forgotMsg && <Alert severity="success">{forgotMsg}</Alert>}
              <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="voce@fazenda.com.br" required />
              <Button fullWidth type="submit" variant="contained" disabled={submitting} sx={primaryBtn}>
                {submitting ? "Enviando…" : "Mandar o link"}
              </Button>
              <Button
                onClick={() => {
                  setForgotMode(false);
                  setForgotMsg("");
                  setError("");
                }}
                sx={{ color: "primary.main" }}
              >
                Voltar pro login
              </Button>
            </Box>
          ) : (
            <>
              <Box role="tablist" aria-label="Entrar ou criar conta" sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", bgcolor: "surface.muted", borderRadius: "14px", p: 0.5 }}>
                {[
                  { id: false, label: "Entrar" },
                  { id: true, label: "Criar conta" },
                ].map((tab) => {
                  const on = isRegistering === tab.id;
                  return (
                    <Box
                      key={tab.label}
                      component="button"
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => {
                        setIsRegistering(tab.id);
                        setError("");
                      }}
                      sx={{ height: 44, border: 0, borderRadius: "11px", fontFamily: "inherit", fontSize: "0.9375rem", cursor: "pointer", bgcolor: on ? "background.paper" : "transparent", color: on ? "text.primary" : "text.secondary", fontWeight: on ? 800 : 600 }}
                    >
                      {tab.label}
                    </Box>
                  );
                })}
              </Box>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {isRegistering && (
                  <Field label="Nome" name="full_name" autoComplete="name" value={form.full_name} onChange={handleChange} placeholder="Como o Zé te chama" />
                )}
                <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="voce@fazenda.com.br" required />
                <Field
                  label="Senha"
                  name="password"
                  type="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={handleChange}
                  inputProps={{ minLength: 6 }}
                  required
                  aside={
                    !isRegistering && (
                      <Box
                        component="button"
                        type="button"
                        onClick={() => {
                          setForgotMode(true);
                          setError("");
                        }}
                        sx={{ border: 0, bgcolor: "transparent", p: 0, fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 600, color: "primary.main", cursor: "pointer" }}
                      >
                        Esqueci a senha
                      </Box>
                    )
                  }
                />
                <Button fullWidth type="submit" variant="contained" disabled={submitting} sx={{ ...primaryBtn, mt: 0.5 }}>
                  {submitting ? "Entrando…" : isRegistering ? "Criar conta" : "Entrar"}
                </Button>
              </Box>
              {IS_DEMO && (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "text.secondary", fontSize: "0.8125rem" }}>
                    <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "divider" }} />
                    ou
                    <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "divider" }} />
                  </Box>
                  <Button fullWidth variant="outlined" disabled={submitting} onClick={enterDemo} sx={outlineBtn}>
                    Testar sem conta (demo)
                  </Button>
                </>
              )}
            </>
          )}
          <Typography sx={{ mt: "auto", pt: 2, fontSize: "0.8125rem", lineHeight: 1.5, color: "text.secondary", textAlign: "center" }}>
            O Zé dá uma hipótese de diagnóstico. Para decisões de aplicação, confirme com um engenheiro-agrônomo.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

const primaryBtn = {
  height: 56,
  borderRadius: "16px",
  fontWeight: 800,
  fontSize: "1.0625rem",
  bgcolor: "primary.main",
  color: "primary.contrastText",
  boxShadow: "none",
  "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
};
const outlineBtn = {
  height: 52,
  borderRadius: "16px",
  fontWeight: 700,
  fontSize: "1rem",
  border: "1.5px solid",
  borderColor: "text.primary",
  color: "text.primary",
  "&:hover": { border: "1.5px solid", borderColor: "text.primary", bgcolor: "action.hover" },
};

/** Campo do m-Login: rótulo em cima, 52 px, cantos 14 e foco verde-broto. */
function Field({ label, name, aside, inputProps, ...rest }) {
  const id = "campo-" + name;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Box component="label" htmlFor={id} sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
          {label}
        </Box>
        {aside}
      </Box>
      <InputBase
        id={id}
        name={name}
        inputProps={inputProps}
        {...rest}
        sx={{
          height: 52,
          px: 2,
          border: "1.5px solid",
          borderColor: (t) => (t.palette.mode === "dark" ? "#3A5243" : "#B9C4B3"),
          borderRadius: "14px",
          bgcolor: "background.paper",
          fontSize: "1.0625rem",
          "&.Mui-focused": { borderColor: "primary.main", outline: "3px solid #C8F169", outlineOffset: "1px" },
        }}
      />
    </Box>
  );
}

export default LoginPage;
