import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import Page from "../components/common/Page";
import { resetPassword } from "../services/authService";
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
    <Page
      eyebrow="Recuperação de acesso"
      title="Uma nova senha para continuar."
    >
      <Box
        sx={{
          maxWidth: 480,
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
        }}
      >
        {done ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Senha atualizada. Entre com a nova senha.
            </Alert>
            <Button
              component={Link}
              to="/login?senha=redefinida"
              variant="contained"
            >
              Ir para a entrada
            </Button>
          </>
        ) : !token ? (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Abra o link de recuperação que você recebeu por e-mail.
            </Alert>
            <Button component={Link} to="/login">
              Solicitar outro link
            </Button>
          </>
        ) : (
          <Box component="form" onSubmit={submit}>
            <Stack gap={2}>
              <TextField
                required
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{ htmlInput: { minLength: 6 } }}
                helperText="Use pelo menos 6 caracteres."
              />
              <TextField
                required
                label="Repita a nova senha"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" disabled={busy}>
                {busy ? "Atualizando…" : "Atualizar senha"}
              </Button>
              <Button component={Link} to="/login">
                Voltar para a entrada
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Page>
  );
}
