import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronRight, Cpu, KeyRound, MapPin, Moon, Pencil, Plus, Sun, Trash2, X } from "lucide-react";
import { ErrorState, LoadingState } from "../components/common/Page";
import { useAuth } from "../hooks/useAuth";
import { useColorMode } from "../hooks/useColorMode";
import { useFeatures } from "../contexts/FeaturesContext";
import usePreferredModel from "../hooks/usePreferredModel";
import { getUsageSummary } from "../services/usageService";
import {
  listTalhoes,
  createTalhao,
  deleteTalhao,
} from "../services/talhoesService";
function Fields({ onChange }) {
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
        if (active) {
          setItems(list);
          onChange?.(list.length);
        }
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
    // onChange é só um callback de contagem; recarregar por ele daria laço.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        Cadastre as áreas da sua lavoura. Cada laudo fica no talhão escolhido
        na hora da foto, e o histórico agrupa por talhão.
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
function UsageBar({ label, feature }) {
  if (!feature) return null;
  const limited = feature.limit !== null && feature.limit !== undefined;
  const pct = limited ? Math.min(100, (feature.used / Math.max(1, feature.limit)) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", mb: 0.75 }}>
        <span>{label}</span>
        <Box component="span" sx={{ fontFamily: (t) => t.typography.fontFamilyMono }}>
          {limited ? `${feature.used}/${feature.limit}` : `${feature.used} · sem limite`}
        </Box>
      </Box>
      {limited && (
        <Box sx={{ height: 8, bgcolor: "#22362A", borderRadius: 999, overflow: "hidden" }}>
          <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: "#C8F169", borderRadius: 999, animation: "zpFill 1.1s .3s cubic-bezier(.2,.7,.2,1) both" }} />
        </Box>
      )}
    </Box>
  );
}

function Row({ icon: Icon, label, hint, aside, to, onClick, first = false }) {
  const linkProps = to ? { component: Link, to } : { component: "button", type: "button", onClick };
  return (
    <Box
      {...linkProps}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        minHeight: 56,
        px: 2,
        py: 1,
        border: 0,
        borderTop: first ? "none" : "1px solid",
        borderColor: "divider",
        bgcolor: "transparent",
        color: "text.primary",
        textDecoration: "none",
        textAlign: "left",
        fontFamily: "inherit",
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box sx={{ color: "primary.main", display: "flex" }}>
        <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
      </Box>
      <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
        <Box component="span" sx={{ display: "block", fontSize: "1rem", fontWeight: 600 }}>{label}</Box>
        {hint && <Box component="span" sx={{ display: "block", fontSize: "0.8125rem", color: "text.secondary" }}>{hint}</Box>}
      </Box>
      {aside}
      <Box sx={{ color: "text.secondary", display: "flex" }}>
        <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
      </Box>
    </Box>
  );
}

function SwitchRow({ icon: Icon, label, hint, checked, onToggle, first = false }) {
  return (
    <Box
      component="button"
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%", minHeight: hint ? 64 : 56, px: 2, border: 0, borderTop: first ? "none" : "1px solid", borderColor: "divider", bgcolor: "transparent", color: "text.primary", textAlign: "left", fontFamily: "inherit", cursor: "pointer" }}
    >
      <Box sx={{ color: "primary.main", display: "flex" }}>
        <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
      </Box>
      <Box component="span" sx={{ flex: 1 }}>
        <Box component="span" sx={{ display: "block", fontSize: "1rem", fontWeight: 600 }}>{label}</Box>
        {hint && <Box component="span" sx={{ display: "block", fontSize: "0.8125rem", color: "text.secondary" }}>{hint}</Box>}
      </Box>
      <Box component="span" aria-hidden="true" sx={{ position: "relative", width: 52, height: 30, borderRadius: 999, flexShrink: 0, transition: "background .2s", bgcolor: checked ? "primary.main" : "#C5CEC0" }}>
        <Box component="span" sx={{ position: "absolute", top: 3, left: checked ? 25 : 3, width: 24, height: 24, borderRadius: "50%", transition: "left .2s", bgcolor: checked ? "#C8F169" : "#FFFFFF" }} />
      </Box>
    </Box>
  );
}

const card = { bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "18px", overflow: "hidden" };

/**
 * Perfil — m-Perfil do canvas: quem é, o uso de hoje, atalhos (talhões,
 * modelo, chaves de API), "Modo campo" e tema escuro, sobre e sair. Edição
 * do nome, talhões e modelo abrem em janelas sobre a tela.
 */
export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { mode, toggleColorMode, field, toggleFieldMode } = useColorMode();
  const features = useFeatures();
  const { model, name: modelName, options, choose } = usePreferredModel();
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [usage, setUsage] = useState(null);
  const [talhoesCount, setTalhoesCount] = useState(null);
  const [dialog, setDialog] = useState(null); // "nome" | "talhoes" | "modelo"
  const [name, setName] = useState(user?.full_name || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getUsageSummary().then((u) => alive && setUsage(u)).catch(() => {});
    listTalhoes().then((l) => alive && setTalhoesCount(l.length)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const saveName = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updateProfile({ full_name: name.trim() });
      setDialog(null);
    } catch {
      setError("Não foi possível salvar seu nome. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const nome = user?.full_name || "Produtor";
  const iniciais = nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "Z";
  const plano = user?.plan?.display_name || user?.plan?.name || "Gratuito";
  const inf = usage?.inference;
  const unlimited = inf && (inf.limit === null || inf.limit === undefined);

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: "auto",
        px: { xs: 2.5, md: 4 },
        pt: { xs: 2.5, md: 5 },
        pb: 4,
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
        "@keyframes zpFill": { from: { width: 0 } },
        "@keyframes zpUp": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.75}>
        <Box sx={{ width: 60, height: 60, borderRadius: "18px", bgcolor: "primary.main", color: "#C8F169", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontStretch: "115%", fontSize: "1.375rem", flexShrink: 0 }}>
          {iniciais}
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography component="h1" sx={{ m: 0, fontWeight: 800, fontSize: "1.25rem" }} noWrap>
            {nome}
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
            {talhoesCount === null ? "" : `${talhoesCount} ${talhoesCount === 1 ? "talhão" : "talhões"} · `}plano {plano}
          </Typography>
        </Box>
        <IconButton aria-label="Editar nome" onClick={() => { setName(user?.full_name || ""); setDialog("nome"); }}>
          <Pencil size={18} />
        </IconButton>
      </Stack>

      {usage && (
        <Box sx={{ bgcolor: "#0B1510", color: "#EEF2E8", borderRadius: "20px", p: 2, display: "flex", flexDirection: "column", gap: 1.5, animation: "zpUp .5s cubic-bezier(.2,.7,.2,1) both" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9375rem" }}>Uso de hoje</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#B7C2B4" }}>renova à meia-noite</Typography>
          </Box>
          <UsageBar label="Análises de foto" feature={usage.inference} />
          <UsageBar label="Mensagens com o Zé" feature={usage.chat} />
          {!unlimited && (
            <Box component={Link} to="/planos" sx={{ height: 44, borderRadius: "12px", bgcolor: "#C8F169", color: "#0F1A13", fontWeight: 800, fontSize: "0.9375rem", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Liberar análises sem limite
            </Box>
          )}
        </Box>
      )}

      <Box sx={card}>
        <Row first icon={MapPin} label="Meus talhões" onClick={() => setDialog("talhoes")} />
        <Row
          icon={Cpu}
          label="Modelo de análise"
          onClick={() => setDialog("modelo")}
          aside={<Box component="span" sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.8125rem", color: "text.secondary" }}>{modelName}</Box>}
        />
        <Row
          icon={KeyRound}
          label="Chaves de API"
          to={features?.api_access ? "/api-docs" : "/planos"}
          aside={!features?.api_access && <Box component="span" sx={{ fontSize: "0.75rem", fontWeight: 700, bgcolor: "surface.muted", borderRadius: 999, px: 1, py: 0.25 }}>Pro</Box>}
        />
      </Box>

      <Box sx={card}>
        <SwitchRow first icon={Sun} label="Modo campo" hint="Letra maior e contraste máximo, pro sol" checked={Boolean(field)} onToggle={toggleFieldMode} />
        <SwitchRow icon={Moon} label="Tema escuro" checked={mode === "dark"} onToggle={toggleColorMode} />
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box component={Link} to="/sobre" sx={{ fontSize: "0.9375rem", fontWeight: 700, py: 1.5, color: "primary.main", textDecoration: "none" }}>
          Sobre o Zé e os modelos
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => {
            logout();
            navigate("/");
          }}
          sx={{ border: 0, bgcolor: "transparent", fontFamily: "inherit", fontSize: "0.9375rem", fontWeight: 700, py: 1.5, color: "#8A1C12", cursor: "pointer" }}
        >
          Sair
        </Box>
      </Stack>

      {/* Nome */}
      <Dialog open={dialog === "nome"} onClose={() => !busy && setDialog(null)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={saveName}>
          <DialogTitle>Como o Zé te chama?</DialogTitle>
          <DialogContent>
            <TextField fullWidth required autoFocus label="Seu nome" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} sx={{ mt: 1 }} />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button disabled={busy} onClick={() => setDialog(null)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={busy || !name.trim()}>{busy ? "Salvando…" : "Salvar"}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Talhões */}
      <Dialog open={dialog === "talhoes"} onClose={() => setDialog(null)} fullWidth maxWidth="sm" fullScreen={fullScreen}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Meus talhões
          <IconButton aria-label="Fechar" onClick={() => setDialog(null)}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Fields onChange={setTalhoesCount} />
        </DialogContent>
      </Dialog>

      {/* Modelo */}
      <Dialog open={dialog === "modelo"} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Modelo de análise</DialogTitle>
        <DialogContent>
          <Box role="radiogroup" aria-label="Modelo de análise" sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
            {options.map((m) => {
              const on = m.id === model;
              return (
                <Box
                  key={m.id}
                  component="button"
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => { choose(m.id); setDialog(null); }}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 56, px: 1.75, borderRadius: "14px", border: on ? "2px solid" : "1px solid", borderColor: on ? "primary.main" : "divider", bgcolor: "background.paper", fontFamily: "inherit", textAlign: "left", cursor: "pointer", color: "text.primary" }}
                >
                  <Box component="span" aria-hidden="true" sx={{ width: 18, height: 18, borderRadius: "50%", boxSizing: "border-box", border: on ? "5px solid" : "2px solid", borderColor: on ? "primary.main" : "#8A9B86", bgcolor: on ? "#C8F169" : "transparent", flexShrink: 0 }} />
                  <Box component="span">
                    <Box component="span" sx={{ display: "block", fontWeight: 700 }}>{m.name}</Box>
                    <Box component="span" sx={{ display: "block", fontSize: "0.8125rem", color: "text.secondary" }}>{m.detail}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Os modelos disponíveis dependem do seu plano.{" "}
            <Link to="/planos">Ver planos</Link>
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
