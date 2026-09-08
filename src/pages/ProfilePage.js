import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowRight, LogOut, Plus, Trash2 } from "lucide-react";
import Page, { ErrorState, LoadingState } from "../components/common/Page";
import { useAuth } from "../hooks/useAuth";
import { useColorMode } from "../hooks/useColorMode";
import { getDiagnosesPage } from "../services/historyService";
import {
  listTalhoes,
  createTalhao,
  deleteTalhao,
} from "../services/talhoesService";
function Fields() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [remove, setRemove] = useState(null),
    [form, setForm] = useState({ nome: "", hectares: "", cultura: "soja" }),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    listTalhoes()
      .then((list) => {
        if (active) setItems(list);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar os talhões.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version]);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createTalhao(form);
      setForm({ nome: "", hectares: "", cultura: "soja" });
      setOpen(false);
      setVersion((v) => v + 1);
    } catch {
      setError("Não foi possível salvar. Confira os dados e tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography component="h2" variant="h6">
          Meus talhões
        </Typography>
        <Button startIcon={<Plus size={18} />} onClick={() => setOpen(true)}>
          Adicionar
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Cadastre as áreas da sua lavoura. Os diagnósticos ainda não são
        vinculados automaticamente a esses cadastros.
      </Typography>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            setError("");
            setVersion((v) => v + 1);
          }}
        />
      )}
      {loading ? (
        <LoadingState label="Carregando talhões…" />
      ) : !items.length ? (
        <Typography color="text.secondary">
          Nenhum talhão cadastrado.
        </Typography>
      ) : (
        items.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Box>
              <Typography fontWeight={700}>{item.nome}</Typography>
              <Typography color="text.secondary" variant="body2">
                {item.hectares ? item.hectares + " ha · " : ""}
                {item.cultura}
              </Typography>
            </Box>
            <IconButton
              aria-label={"Excluir talhão " + item.nome}
              onClick={() => setRemove(item)}
            >
              <Trash2 size={19} />
            </IconButton>
          </Stack>
        ))
      )}
      <Dialog
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={save}>
          <DialogTitle>Novo talhão</DialogTitle>
          <DialogContent>
            <Stack gap={2} mt={1}>
              <TextField
                autoFocus
                required
                label="Nome do talhão"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
              <TextField
                label="Área em hectares (opcional)"
                type="number"
                value={form.hectares}
                onChange={(e) => setForm({ ...form, hectares: e.target.value })}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              />
            </Stack>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? "Salvando…" : "Salvar talhão"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog
        open={!!remove}
        onClose={() => {
          if (!busy) setRemove(null);
        }}
      >
        <DialogTitle>Excluir {remove?.nome}?</DialogTitle>
        <DialogContent>
          Este cadastro será removido. A ação não pode ser desfeita.
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setRemove(null)}>
            Manter
          </Button>
          <Button
            color="error"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await deleteTalhao(remove.id);
                setRemove(null);
                setVersion((v) => v + 1);
              } catch {
                setError("Não foi possível excluir o talhão.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth(),
    { mode, toggleColorMode } = useColorMode(),
    navigate = useNavigate();
  const [name, setName] = useState(user?.full_name || ""),
    [count, setCount] = useState(null),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    getDiagnosesPage({ limit: 1 })
      .then((data) => {
        if (active) setCount(data.total);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile({ full_name: name.trim() });
      setSuccess("Seu nome foi atualizado.");
    } catch {
      setError("Não foi possível salvar seu perfil. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page
      eyebrow="Sua conta"
      title="Seu espaço no Zé."
      description="Cuide do seu perfil, dos seus registros e da aparência do aplicativo."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: ".8fr 1.2fr" },
          gap: 3,
        }}
      >
        <Stack gap={3}>
          <Box
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                mb: 2,
              }}
            >
              {user?.full_name?.[0]?.toUpperCase() || "Z"}
            </Avatar>
            <Typography component="h2" variant="h5">
              {user?.full_name || "Produtor"}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ overflowWrap: "anywhere" }}
            >
              {user?.email}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="overline">Seu plano</Typography>
            <Typography component="h2" variant="h6">
              {user?.plan?.display_name || user?.plan?.name || "Gratuito"}
            </Typography>
            <Button
              component={Link}
              to="/planos"
              endIcon={<ArrowRight size={18} />}
            >
              Comparar recursos
            </Button>
            <Divider sx={{ my: 2 }} />
            <Button
              component={Link}
              to="/historico"
              endIcon={<ArrowRight size={18} />}
            >
              {count === null
                ? "Abrir histórico"
                : count + (count === 1 ? " registro no histórico" : " registros no histórico")}
            </Button>
          </Box>
          <Box
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
            }}
          >
            <Typography component="h2" variant="h6" mb={1}>
              Aparência
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={mode === "dark"} onChange={toggleColorMode} />
              }
              label="Tema escuro"
            />
            <Typography variant="body2" color="text.secondary">
              A preferência fica salva neste navegador.
            </Typography>
          </Box>
          <Button
            color="inherit"
            startIcon={<LogOut size={18} />}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sair da conta
          </Button>
        </Stack>
        <Stack gap={3}>
          <Box
            component="form"
            onSubmit={save}
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
            }}
          >
            <Typography component="h2" variant="h6" mb={2}>
              Como podemos chamar você?
            </Typography>
            <TextField
              fullWidth
              required
              label="Seu nome"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={busy || !name.trim()}
              sx={{ mt: 2 }}
            >
              {busy ? "Salvando…" : "Salvar perfil"}
            </Button>
          </Box>
          <Box
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
            }}
          >
            <Fields />
          </Box>
          <Button
            component={Link}
            to="/api-docs"
            endIcon={<ArrowRight size={18} />}
          >
            Documentação da API
          </Button>
        </Stack>
      </Box>
    </Page>
  );
}
