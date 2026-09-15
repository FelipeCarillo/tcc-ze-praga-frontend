import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { resetPassword } from "../services/authService";
import { ReactComponent as Marca } from "../assets/brand/marca.svg";

export default function ResetPasswordPage() {
  const token = new URLSearchParams(useLocation().search).get("token") || "";
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas precisam ser iguais.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch {
      setError(
        "Não foi possível redefinir. O link pode ter expirado ou já ter sido usado. Solicite um novo link na tela de entrada.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        minHeight: { md: "calc(100vh - 65px)" },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          background: "linear-gradient(160deg, #1F5A3D, #0F3D27)",
          color: (t) => t.palette.brand.creme,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Marca style={{ width: 36, height: 36, display: "block" }} />
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontFamilyDisplay,
              fontWeight: 800,
              fontSize: "1.3rem",
              color: (t) => t.palette.brand.milho,
            }}
          >
            Zé Praga
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontFamilyHand,
              color: (t) => t.palette.brand.milho,
              fontSize: "1.8rem",
              mb: 1,
            }}
          >
            Recuperação de acesso
          </Typography>
          <Typography variant="h2" sx={{ color: (t) => t.palette.brand.creme }}>
            Vamos colocar sua conta de pé de novo.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Escolha uma senha forte e guarde-a em segurança.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
          maxWidth: 440,
          mx: "auto",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Marca style={{ width: 30, height: 30, display: "block" }} />
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontFamilyDisplay,
              fontWeight: 800,
              color: "primary.main",
            }}
          >
            Zé Praga
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: (t) => t.typography.fontFamilyHand,
            color: "secondary.main",
            fontSize: "1.5rem",
          }}
        >
          Recuperação de acesso
        </Typography>
        <Typography component="h1" variant="h3" sx={{ mb: 1 }}>
          Crie uma nova senha
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use uma senha com pelo menos 6 caracteres para voltar ao campo.
        </Typography>
        {done ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Senha atualizada. Entre com a nova senha.
            </Alert>
            <Button
              component={Link}
              to="/login?senha=redefinida"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ py: 1.25 }}
            >
              Ir para a entrada
            </Button>
          </>
        ) : !token ? (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Abra o link de recuperação que você recebeu por e-mail.
            </Alert>
            <Button component={Link} to="/login" fullWidth sx={{ py: 1.25 }}>
              Solicitar novo link
            </Button>
          </>
        ) : (
          <Box component="form" onSubmit={submit}>
            <TextField
              fullWidth
              required
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{ minLength: 6 }}
              helperText="Use pelo menos 6 caracteres."
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              label="Repita a nova senha"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              sx={{ mb: 2 }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="secondary"
              disabled={busy}
              sx={{ py: 1.25 }}
            >
              {busy ? "Atualizando…" : "Atualizar senha"}
            </Button>
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button component={Link} to="/login" sx={{ color: "primary.main" }}>
                Voltar para a entrada
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
